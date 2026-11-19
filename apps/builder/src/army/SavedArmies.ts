import type { ArmyList } from '@rulebook/rules';

import { ArmyDraft } from './ArmyDraft';

/** One saved army: its list and when it was last changed (ms since epoch). */
export interface SavedArmy {
  id: string;
  updatedAt: number;
  list: ArmyList;
}

/**
 * Every army saved in this browser. Changes return a new instance (React state stays immutable). Armies whose list
 * can't be read are kept aside in `unreadable` so a bad save never takes the others down with it.
 */
export class SavedArmies {
  private constructor(
    private readonly armies: SavedArmy[],
    readonly unreadable: unknown[] = [],
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

    return new SavedArmies(armies, unreadable);
  }

  /** Unreadable armies are written back as they were, so a fix in a later version can still read them. */
  toJSON(): { armies: unknown[] } {
    return { armies: [...this.armies, ...this.unreadable] };
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
    );
  }

  /** A copy of an army under `newId`, named as a copy. */
  duplicate(id: string, newId: string, now: number): SavedArmies {
    const draft = this.draft(id);

    return draft ? this.put(newId, draft.rename(`${draft.list.name} (copy)`), now) : this;
  }

  remove(id: string): SavedArmies {
    return new SavedArmies(
      this.armies.filter((a) => a.id !== id),
      this.unreadable,
    );
  }
}
