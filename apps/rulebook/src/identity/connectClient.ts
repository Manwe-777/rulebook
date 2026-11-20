import { RulebookClient, TOPIC } from '@rulebook/sharing';
import { ToolDb, ToolDbNip07User } from 'tool-db';

import { EXTENSION_TIMEOUT_MS } from '../constants';

/** Waits for `promise`, or calls `onTimeout` and fails after `ms`. */
function withTimeout<T>(promise: Promise<T>, ms: number, onTimeout: () => void, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      onTimeout();
      reject(new Error(message));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

/** How long to wait for the first relay connection. */
const CONNECT_TIMEOUT_MS = 5000;

/** Opens a tool-db connection and a Rulebook client on it, signing with an extension or a secret key when given. */
export async function connectClient(
  relays: string[],
  owner: string,
  signer: { extension: true } | { secret: string } | null,
  onLinkChange?: (connected: boolean) => void,
): Promise<{ db: ToolDb; client: RulebookClient }> {
  // Resolves once at least one relay is connected, so the first reads see the relays and not only the empty cache.
  const extension = signer !== null && 'extension' in signer;
  const db = new ToolDb({ relays, topic: TOPIC, ...(extension ? { userAdapter: ToolDbNip07User } : {}) });

  // With an extension, tool-db is ready only once the extension shares its public key, which can wait for ever.
  if (extension)
    await withTimeout(db.ready, EXTENSION_TIMEOUT_MS, () => db.close(), 'The browser extension did not answer');
  else await db.ready;

  if (!db.isConnected) {
    await new Promise<void>((resolve, reject) => {
      db.onConnect = () => resolve();
      setTimeout(() => reject(new Error('Could not reach the relays')), CONNECT_TIMEOUT_MS);
    });
  }

  // tool-db keeps retrying lost relays; these report when the last one drops and when one is back.
  db.onConnect = () => onLinkChange?.(true);
  db.onDisconnect = () => onLinkChange?.(false);

  if (signer && 'secret' in signer) await db.keysSignIn(signer.secret);

  return { db, client: new RulebookClient(db, owner) };
}
