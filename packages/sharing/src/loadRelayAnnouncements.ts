import { TOPIC } from './constants';
import { RulebookClient } from './RulebookClient';
import type { RelayAnnouncement } from './schemas';

/** The relays that announced themselves recently, read with a short-lived connection. */
export async function loadRelayAnnouncements(relays: string[], owner: string): Promise<RelayAnnouncement[]> {
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

    return await new RulebookClient(db, owner).relays();
  } finally {
    await db.close();
  }
}
