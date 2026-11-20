import type { ArmyList } from '@rulebook/rules';
import type { SyncedList } from '@rulebook/sharing/sync';

import { ArmyDraft } from './ArmyDraft';

/** One saved army: its list and when it was last changed (ms since epoch). */
export interface SavedArmy {
  id: string;
  updatedAt: number;
  list: ArmyList;
}

/** An army deleted on this device, remembered so the deletion reaches the other synced devices. */
export interface DeletedArmy {
  id: string;
  deletedAt: number;
}

/**
 * Every army saved in this browser. Changes return a new instance (React state stays immutable). Armies whose list
 * can't be read are kept aside in `unreadable` so a bad save never takes the others down with it. Deleted armies are
 * remembered by id and time, so sync can tell a deletion from an army this device never had.
 */
export class SavedArmies {
  private constructor(
    private readonly armies: SavedArmy[],
    readonly unreadable: unknown[] = [],
    private readonly deleted: DeletedArmy[] = [],
  ) {}

  static empty(): SavedArmies {
    return new SavedArmies([]);
  }

  /** Saved data, or null when it isn't a list of armies at all. */
  static fromSave(raw: unknown): SavedArmies | null {
    const items = (raw as { armies?: unknown } | null)?.armies;

    if (!Array.isArray(items)) return null;

    const armies: SavedArmy[] = [];
    const unreadable: unknown[] = [];

    for (const item of items) {
      const { id, updatedAt, list } = (item ?? {}) as Partial<SavedArmy>;
      const draft = ArmyDraft.fromSave(list);

      if (typeof id === 'string' && draft) armies.push({ id, updatedAt: Number(updatedAt) || 0, list: draft.list });
      else unreadable.push(item);
    }

    return new SavedArmies(armies, unreadable, readDeleted((raw as { deleted?: unknown }).deleted));
  }

  /** Unreadable armies are written back as they were, so a fix in a later version can still read them. */
  toJSON(): { armies: unknown[]; deleted: DeletedArmy[] } {
    return { armies: [...this.armies, ...this.unreadable], deleted: this.deleted };
  }

  /** Newest first. */
  get all(): SavedArmy[] {
    return [...this.armies].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  get size(): number {
    return this.armies.length;
  }

  draft(id: string): ArmyDraft | null {
    const army = this.armies.find((a) => a.id === id);

    return army ? ArmyDraft.fromSave(army.list) : null;
  }

  /** Saves a list under `id`, adding it when new. */
  put(id: string, draft: ArmyDraft, now: number): SavedArmies {
    const army: SavedArmy = { id, updatedAt: now, list: draft.toJSON() };
    const exists = this.armies.some((a) => a.id === id);

    return new SavedArmies(
      exists ? this.armies.map((a) => (a.id === id ? army : a)) : [...this.armies, army],
      this.unreadable,
      this.deleted.filter((d) => d.id !== id),
    );
  }

  /** A copy of an army under `newId`, named as a copy. */
  duplicate(id: string, newId: string, now: number): SavedArmies {
    const draft = this.draft(id);

    return draft ? this.put(newId, draft.rename(`${draft.list.name} (copy)`), now) : this;
  }

  /** Deletes an army, remembering when so the deletion syncs. */
  remove(id: string, now: number): SavedArmies {
    return new SavedArmies(
      this.armies.filter((a) => a.id !== id),
      this.unreadable,
      [...this.deleted.filter((d) => d.id !== id), { id, deletedAt: now }],
    );
  }

  /** Every army and deletion as sync sends them. */
  get synced(): SyncedList[] {
    return [
      ...this.armies.map(({ id, updatedAt, list }) => ({ id, updatedAt, list })),
      ...this.deleted.map(({ id, deletedAt }) => ({ id, updatedAt: deletedAt, list: null })),
    ];
  }

  /**
   * Merges the armies synced from other devices: for each army the newest change wins, a deletion included. Returns
   * the merged armies and what this device has that is newer than (or missing from) the synced copy, to send.
   * Synced lists this version can't read are left alone.
   */
  merge(remote: SyncedList[]): { saved: SavedArmies; send: SyncedList[] } {
    const local = new Map(this.synced.map((e) => [e.id, e]));
    const theirs = new Map(remote.map((e) => [e.id, e]));
    const newer = [...theirs.values()].filter((e) => !local.has(e.id) || e.updatedAt > local.get(e.id)!.updatedAt);
    const saved = newer.reduce<SavedArmies>((armies, entry) => armies.apply(entry), this);

    const send = [...local.values()].filter((e) => {
      const other = theirs.get(e.id);

      return !other || e.updatedAt > other.updatedAt;
    });

    return { saved, send };
  }

  /** Takes one synced army or deletion as it is, keeping its time. */
  private apply(entry: SyncedList): SavedArmies {
    if (entry.list === null) return this.remove(entry.id, entry.updatedAt);

    const draft = ArmyDraft.fromSave(entry.list);

    if (!draft) return this;

    const army: SavedArmy = { id: entry.id, updatedAt: entry.updatedAt, list: draft.list };

    return new SavedArmies(
      [...this.armies.filter((a) => a.id !== entry.id), army],
      this.unreadable,
      this.deleted.filter((d) => d.id !== entry.id),
    );
  }
}

/** Deletions as saved, leaving out anything that isn't one. */
function readDeleted(raw: unknown): DeletedArmy[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter((d): d is DeletedArmy => typeof d?.id === 'string' && typeof d?.deletedAt === 'number');
}
