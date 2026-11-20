import type { ToolDb } from 'tool-db';
import { z } from 'zod';

import { KEYS, READ_TIMEOUT_MS } from '../constants';
import { selfCipher } from './selfCipher';

/** One saved army as synced: its id, when it last changed, and its list, or null once it has been deleted. */
export interface SyncedList {
  id: string;
  updatedAt: number;
  list: unknown;
}

const stored = z.strictObject({ c: z.string() });
const plain = z.strictObject({ id: z.string().min(1), updatedAt: z.number(), list: z.unknown() });

/** The part of an army id that is safe in a key: letters, digits, `-` and `_`. */
const keyId = (id: string) => id.replace(/[^\w-]/g, '_');

/**
 * Saved armies kept in the user's own namespace on the relays (`:<p>.list/<id>`), encrypted to their own key: only
 * that user's devices can read them, and only their key can change them.
 */
export class SyncedLists {
  private readonly cipher: ReturnType<typeof selfCipher>;

  /** `db` must be signed in with `secret`. */
  constructor(
    private readonly db: ToolDb,
    secret: string,
  ) {
    this.cipher = selfCipher(secret);
  }

  /** Writes one army (or its deletion, with `list: null`). */
  async put(entry: SyncedList): Promise<void> {
    await this.db.putData(KEYS.list(keyId(entry.id)), { c: this.cipher.encrypt(JSON.stringify(entry)) }, true);
  }

  /** Every army synced under this key, deletions included. Entries that can't be read are skipped. */
  async all(): Promise<SyncedList[]> {
    const keys = await this.db.queryKeys(KEYS.list(''), true, READ_TIMEOUT_MS);
    const values = await Promise.all(keys.map((key) => this.db.getData(key, false, READ_TIMEOUT_MS)));

    return values.flatMap((value) => {
      const entry = this.read(value);

      return entry ? [entry] : [];
    });
  }

  private read(value: unknown): SyncedList | null {
    const outer = stored.safeParse(value);

    if (!outer.success) return null;

    try {
      const inner = plain.safeParse(JSON.parse(this.cipher.decrypt(outer.data.c)));

      return inner.success ? inner.data : null;
    } catch {
      return null;
    }
  }
}
