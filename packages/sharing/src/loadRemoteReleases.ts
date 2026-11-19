import { TOPIC } from './constants';
import { RulebookClient } from './RulebookClient';
import type { ReleasedRules } from './schemas';

/** The newest release of every faction on the relays (files and release info), read with a short-lived connection. */
export async function loadRemoteReleases(relays: string[], owner: string): Promise<ReleasedRules> {
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

    return await new RulebookClient(db, owner).latestReleases();
  } finally {
    await db.close();
  }
}
