import type { RulesFile } from '@rulebook/rules';
import { createStore, del, get, set, type UseStore } from 'idb-keyval';

import { CACHE_DB } from '../constants';

interface Saved {
  files: RulesFile[];
  savedAt: number;
}

/**
 * The released rules last read from the relays, kept in this browser's IndexedDB so the apps show them straight away
 * and work offline. Every app on the same site shares it. Only verified releases are written here, kept per owner key
 * so a site built for another owner never shows them.
 */
export class ReleaseCache {
  private readonly store: UseStore | null;
  private readonly key: string;

  constructor(owner: string) {
    this.key = `released-files:${owner}`;
    this.store = typeof indexedDB === 'undefined' ? null : createStore(CACHE_DB, 'releases');
  }

  /** The saved files, or null when nothing (readable) is saved or there's no IndexedDB. */
  async read(): Promise<Saved | null> {
    if (!this.store) return null;

    try {
      const saved = await get<Saved>(this.key, this.store);

      return saved && Array.isArray(saved.files) ? saved : null;
    } catch {
      return null;
    }
  }

  async write(files: RulesFile[], now = Date.now()): Promise<void> {
    if (!this.store) return;

    try {
      await set(this.key, { files, savedAt: now } satisfies Saved, this.store);
    } catch {
      // Storage full or blocked: the apps still work, only without the offline copy.
    }
  }

  async clear(): Promise<void> {
    if (this.store) await del(this.key, this.store).catch(() => undefined);
  }
}
