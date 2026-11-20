import { TOPIC } from '@rulebook/sharing';
import { type SyncedList, SyncedLists } from '@rulebook/sharing/sync';
import { ToolDb } from 'tool-db';

import type { SavedArmies } from '../army/SavedArmies';

/** How long to wait for the first relay connection, in milliseconds. */
const CONNECT_TIMEOUT_MS = 8000;

/**
 * One device's connection for syncing its saved armies: signed in with the user's key, it reads the armies synced
 * from other devices, hands them over to be merged, and sends what this device has that is newer.
 */
export class SyncSession {
  private constructor(
    private readonly db: ToolDb,
    private readonly lists: SyncedLists,
  ) {}

  /** Connects to the relays and signs in with the key. Fails when no relay answers in time. */
  static async open(relays: string[], secret: string): Promise<SyncSession> {
    const db = new ToolDb({ relays, topic: TOPIC });

    await db.ready;

    if (!db.isConnected) {
      await new Promise<void>((resolve, reject) => {
        db.onConnect = () => resolve();
        setTimeout(() => reject(new Error('Could not reach the relays')), CONNECT_TIMEOUT_MS);
      });
    }

    await db.keysSignIn(secret);

    return new SyncSession(db, new SyncedLists(db, secret));
  }

  /**
   * One round: reads the synced armies, passes them to `merge` (which applies the newer ones here), and sends this
   * device's newer ones, read from `current` after merging.
   */
  async sync(current: () => SavedArmies, merge: (remote: SyncedList[]) => void): Promise<void> {
    const remote = await this.lists.all();

    merge(remote);

    for (const entry of current().merge(remote).send) await this.lists.put(entry);
  }

  close(): void {
    this.db.close();
  }
}
