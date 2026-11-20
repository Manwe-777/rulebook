import { loadRelayAnnouncements, TOPIC } from '@rulebook/sharing';
import { PROJECT } from '@rulebook/sharing/project';
import { ToolDb } from 'tool-db';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A tool-db client on the project's relays: `RELAYS` (comma separated) or project.json's, plus every relay that
 * announced itself. Waits for one relay to connect (or fails), then gives the slower ones a little longer, since a
 * write only reaches the relays connected at that moment.
 */
export async function connectProject(
  owner: string,
  env: Record<string, string | undefined>,
): Promise<{ db: ToolDb; relays: string[] }> {
  const bootstrap = env.RELAYS?.split(',').filter(Boolean) ?? PROJECT.relays;
  const announced = (await loadRelayAnnouncements(bootstrap, owner).catch(() => [])).map((r) => r.url);
  const relays = [...new Set([...bootstrap, ...announced])];
  const db = new ToolDb({ relays, topic: TOPIC });

  await db.ready;

  for (let waited = 0; !db.isConnected; waited += 250) {
    if (waited >= 15_000) throw new Error(`None of the relays answered: ${relays.join(', ')}`);
    await wait(250);
  }

  for (let waited = 0; db.relays.connected < relays.length && waited < 10_000; waited += 250) await wait(250);

  return { db, relays };
}
