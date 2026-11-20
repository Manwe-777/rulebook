import { createStore, del, get, keys, set, type UseStore } from 'idb-keyval';

import { PHOTO_DB } from '../constants';

/** A photo as stored: bytes and type rather than a Blob, which some browsers can't keep in IndexedDB. */
interface Stored {
  type: string;
  bytes: ArrayBuffer;
}

/**
 * Players' photos of their own models, one per unit of a faction, kept only in this browser's IndexedDB. Components
 * subscribe to hear when a photo changes, so every place showing it updates at once.
 */
export class PhotoStore {
  private readonly store: UseStore | null;
  private readonly listeners = new Set<(key: string) => void>();

  constructor(name = PHOTO_DB) {
    this.store = typeof indexedDB === 'undefined' ? null : createStore(name, 'photos');
  }

  static key(faction: string, unit: string): string {
    return `${faction}/${unit}`;
  }

  async get(faction: string, unit: string): Promise<Blob | null> {
    if (!this.store) return null;

    try {
      const stored = await get<Stored>(PhotoStore.key(faction, unit), this.store);

      // Checked by shape: the stored buffer may come from another realm (a worker, or tests).
      return typeof stored?.bytes?.byteLength === 'number' ? new Blob([stored.bytes], { type: stored.type }) : null;
    } catch {
      return null;
    }
  }

  /** Saves a photo and asks the browser to keep this site's storage, so photos aren't cleared to free space. */
  async set(faction: string, unit: string, photo: Blob): Promise<void> {
    if (!this.store) throw new Error('This browser has no storage for photos.');

    const stored: Stored = { type: photo.type, bytes: await photo.arrayBuffer() };

    await set(PhotoStore.key(faction, unit), stored, this.store);
    await navigator.storage?.persist?.().catch(() => false);
    this.changed(PhotoStore.key(faction, unit));
  }

  async remove(faction: string, unit: string): Promise<void> {
    if (!this.store) return;

    await del(PhotoStore.key(faction, unit), this.store);
    this.changed(PhotoStore.key(faction, unit));
  }

  /** Keys (`faction/unit`) of every saved photo. */
  async keys(): Promise<string[]> {
    return this.store ? ((await keys(this.store)) as string[]) : [];
  }

  /** Calls `listener` with the key of every photo saved or removed; returns the unsubscribe function. */
  subscribe(listener: (key: string) => void): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  private changed(key: string) {
    for (const listener of this.listeners) listener(key);
  }
}

/** The store the app uses. */
export const photoStore = new PhotoStore();
