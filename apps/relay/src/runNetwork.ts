import { copyTopicEvents, RELAY_ANNOUNCE_MS, RulebookClient, TOPIC } from '@rulebook/sharing';
import { pingRelay } from '@rulebook/sharing/relays';
import { ToolDb } from 'tool-db';

import type { RelayConfig } from './readConfig';

/** How often the relay copies data from the others, in milliseconds. */
const SYNC_MS = 60 * 60 * 1000;

/**
 * One round: announce this relay's address (when it has a public one) on the bootstrap relays and itself, then copy
 * the topic's data from the bootstrap relays and every other announced relay that answers.
 */
async function round(config: RelayConfig, secretKey: string, localUrl: string, announce: boolean) {
  const db = new ToolDb({ relays: [localUrl, ...config.bootstrap], topic: TOPIC });

  try {
    await db.ready;

    // Writes made before a relay is connected stay in this process: wait for at least one.
    if (!db.isConnected) {
      await new Promise<void>((resolve, reject) => {
        db.onConnect = () => resolve();
        setTimeout(() => reject(new Error('no relay reachable')), 10_000);
      });
    }

    // A write only reaches the relays connected at that moment: give the others a few seconds.
    for (let waited = 0; db.relays.connected < db.relays.urls.length && waited < 5000; waited += 250) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    await db.keysSignIn(secretKey);

    const client = new RulebookClient(db, config.owner ?? '');

    if (announce && config.publicUrl) await client.announceRelay(config.publicUrl, config.name);

    const announced = (await client.relays()).map((r) => r.url).filter((url) => url !== config.publicUrl);
    const candidates = [...new Set([...config.bootstrap, ...announced])];

    const reachable = (
      await Promise.all(candidates.map(async (url) => ((await pingRelay(url)) === null ? [] : [url])))
    ).flat();

    const { found, accepted } = await copyTopicEvents(reachable, localUrl);

    console.log(
      `Synced from ${reachable.length} of ${candidates.length} relays: ${accepted} of ${found} messages kept`,
    );
  } catch (error) {
    console.error('Relay network round failed:', (error as Error).message);
  } finally {
    await db.close();
  }
}

/**
 * Keeps the relay part of the network: announces its address every few hours and copies data from the other relays
 * every hour. Returns a function that stops it.
 */
export function runNetwork(config: RelayConfig, secretKey: string, localUrl: string): () => void {
  let lastAnnounce = 0;

  const tick = () => {
    const announce = Date.now() - lastAnnounce >= RELAY_ANNOUNCE_MS;

    if (announce) lastAnnounce = Date.now();
    void round(config, secretKey, localUrl, announce);
  };

  tick();
  const timer = setInterval(tick, SYNC_MS);

  return () => clearInterval(timer);
}
