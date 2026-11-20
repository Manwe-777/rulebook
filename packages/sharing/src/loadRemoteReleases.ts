import { TOPIC } from './constants';
import { type LatestOptions, RulebookClient } from './RulebookClient';
import type { RelayAnnouncement, ReleasedRules } from './schemas';

/**
 * The newest release of every faction on the relays (files and release info), read with a short-lived connection.
 * Relays that announced themselves are passed to `onRelays`, read on the same connection. `options` says which
 * releases the caller already has (not downloaded again) and gets each faction as it arrives.
 */
export async function loadRemoteReleases(
  relays: string[],
  owner: string,
  onRelays?: (announced: RelayAnnouncement[]) => void,
  options: LatestOptions = {},
): Promise<ReleasedRules> {
  const { ToolDb } = await import('tool-db');
  const db = new ToolDb({ relays, topic: TOPIC });

  try {
    await db.ready;

    if (!db.isConnected) {
      await new Promise<void>((resolve, reject) => {
        db.onConnect = () => resolve();
        setTimeout(() => reject(new Error('Could not reach the relays')), 5000);
      });
    }

    const client = new RulebookClient(db, owner);
    const rules = await client.latestReleases(options);

    if (onRelays) onRelays(await client.relays().catch(() => []));

    return rules;
  } finally {
    await db.close();
  }
}
