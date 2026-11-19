import type { RulesFile } from '@rulebook/rules';

import { TOPIC } from './constants';
import { RulebookClient } from './RulebookClient';

/** The newest release of every faction on the relays, read with a short-lived connection. */
export async function loadRemoteFiles(relays: string[], owner: string): Promise<RulesFile[]> {
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

    return await new RulebookClient(db, owner).latestFiles();
  } finally {
    await db.close();
  }
}
