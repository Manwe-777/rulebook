import { createStore, del, get, set, type UseStore } from 'idb-keyval';

import { CACHE_DB } from '../constants';
import type { ReleasedRules } from '../schemas';

/** Released rules as saved, with when the relays gave them (ms since epoch). */
export interface SavedReleases {
  rules: ReleasedRules;
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

  /** The saved releases, or null when nothing (readable) is saved or there's no IndexedDB. */
  async read(): Promise<SavedReleases | null> {
    if (!this.store) return null;

    try {
      const saved = await get<{ files?: unknown; releases?: unknown; savedAt?: unknown }>(this.key, this.store);

      if (!saved || !Array.isArray(saved.files)) return null;

      // Copies saved before release info was kept have no `releases`; they still give the files.
      const releases = Array.isArray(saved.releases) ? saved.releases : [];

      return { rules: { files: saved.files, releases } as ReleasedRules, savedAt: Number(saved.savedAt) || 0 };
    } catch {
      return null;
    }
  }

  async write(rules: ReleasedRules, now = Date.now()): Promise<void> {
    if (!this.store) return;

    try {
      await set(this.key, { ...rules, savedAt: now }, this.store);
    } catch {
      // Storage full or blocked: the apps still work, only without the offline copy.
    }
  }

  async clear(): Promise<void> {
    if (this.store) await del(this.key, this.store).catch(() => undefined);
  }
}
