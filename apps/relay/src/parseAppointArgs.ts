import { homedir } from 'node:os';
import { join } from 'node:path';

import { ownerKeyHex } from '@rulebook/sharing';

/** What `appoint` was asked to do. */
export interface AppointRequest {
  /** The key to add or remove, hex. */
  key: string;
  /** Faction ids, or `all` for every released faction and core. */
  factions: string[] | 'all';
  remove: boolean;
  /** The owner key file. */
  keyFile: string;
}

const USAGE =
  'Usage: npm run appoint -w @rulebook/relay -- <npub or hex key> <faction…|all> [--remove] [--key owner.ncryptsec]';

/** Reads `appoint`'s arguments, or says what is wrong with them. */
export function parseAppointArgs(argv: string[], home = homedir()): AppointRequest | { error: string } {
  const args = [...argv];
  const remove = args.includes('--remove');
  const keyAt = args.indexOf('--key');
  const keyFile = keyAt >= 0 ? args[keyAt + 1] : join(home, 'rulebook-owner.ncryptsec');
  const rest = args.filter((a, i) => a !== '--remove' && (keyAt < 0 || (i !== keyAt && i !== keyAt + 1)));
  const [keyText, ...factions] = rest;

  if (!keyText || !factions.length || !keyFile) return { error: USAGE };

  const key = ownerKeyHex(keyText);

  if (!key) return { error: `"${keyText}" is not a public key (npub or 64 hex characters).` };
  if (factions.some((f) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f)))
    return { error: 'Faction ids are lowercase words joined by hyphens.' };

  return { key, factions: factions.includes('all') ? 'all' : factions, remove, keyFile };
}
