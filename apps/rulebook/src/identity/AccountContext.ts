import type { RulebookClient } from '@rulebook/sharing';
import { createContext } from 'react';

import type { Connection } from './connectionSummary';
import type { StoredIdentity } from './storedIdentity';

export interface Account {
  /** False when no relays are configured: nothing can be read from or written to them. */
  online: boolean;
  /** State of the link to the relays. */
  connection: Connection;
  /** Connected client; signs with the identity once there is one (anonymous before). */
  client: RulebookClient | null;
  stored: StoredIdentity | null;
  /** Public key in hex while signing is possible; null with no identity or a locked one. */
  pubkey: string | null;
  locked: boolean;
  /** Makes a browser key when there is no identity yet, and returns the client to write with. */
  ensureKey: () => Promise<RulebookClient | null>;
  /** Uses a pasted key; returns an error message or null. */
  importKey: (text: string, password?: string) => Promise<string | null>;
  protect: (password: string) => Promise<void>;
  unlock: (password: string) => Promise<string | null>;
  switchToExtension: () => Promise<string | null>;
  forget: () => void;
  exportNsec: () => string | null;
  exportNcryptsec: (password: string) => Promise<string | null>;
}

export const AccountContext = createContext<Account | null>(null);
