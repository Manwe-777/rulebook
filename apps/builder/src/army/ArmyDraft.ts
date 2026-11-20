import { type ArmyList, type Library, type ListEntry, listSchema, offeredDispositions } from '@rulebook/rules';

import { DEFAULT_BATTLE_SIZE } from '../constants';

type Wargear = ListEntry['wargear'][number];

/**
 * The army list being built. Every change returns a new draft (React state stays immutable) and keeps the list
 * consistent: removing a unit also detaches what was attached to it, and dropping a detachment drops the enhancements
 * and upgrades that came from it. Whether the list is legal is up to `validateList`.
 */
export class ArmyDraft {
  private constructor(readonly list: ArmyList) {}

  /** A new list for a faction, with the default battle size and the faction's first detachment. */
  static create(library: Library, factionId: string): ArmyDraft {
    const sizes = library.muster?.battleSizes ?? [];
    const battleSize = sizes.find((b) => b.id === DEFAULT_BATTLE_SIZE)?.id ?? sizes[0]?.id ?? DEFAULT_BATTLE_SIZE;
    const faction = library.faction(factionId);
    const name = faction ? `${faction.name} army` : 'New army';

    return new ArmyDraft(
      listSchema.parse({
        name,
        battleSize,
        faction: factionId,
        detachments: library
          .armyDetachments(factionId)
          .slice(0, 1)
          .map((d) => d.id),
      }),
    );
  }

  /** A saved list, or null when the data isn't a valid list. */
  static fromSave(raw: unknown): ArmyDraft | null {
    const parsed = listSchema.safeParse(raw);

    return parsed.success ? new ArmyDraft(parsed.data) : null;
  }

  toJSON(): ArmyList {
    return this.list;
  }

  private with(change: Partial<ArmyList>): ArmyDraft {
    return new ArmyDraft({ ...structuredClone(this.list), ...change });
  }

  private withEntry(id: string, change: (entry: ListEntry) => ListEntry): ArmyDraft {
    return this.with({ units: this.list.units.map((e) => (e.id === id ? change(structuredClone(e)) : e)) });
  }

  entry(id: string): ListEntry | undefined {
    return this.list.units.find((e) => e.id === id);
  }

  rename(name: string): ArmyDraft {
    return this.with({ name });
  }

  /** The army's force disposition, picked from its detachments' when it has several. */
  setDisposition(disposition: string | undefined): ArmyDraft {
    return this.with({ disposition });
  }

  setBattleSize(battleSize: string): ArmyDraft {
    return this.with({ battleSize });
  }

  /**
   * Adds or removes a detachment. Enhancements and upgrades only a removed detachment offered are dropped, and so is
   * the army's disposition when no remaining detachment has it.
   */
  toggleDetachment(library: Library, id: string): ArmyDraft {
    const taken = this.list.detachments.includes(id);
    const detachments = taken ? this.list.detachments.filter((d) => d !== id) : [...this.list.detachments, id];
    const chosen = library.armyDetachments(this.list.faction).filter((d) => detachments.includes(d.id));

    const offered = new Set(
      chosen.filter((d) => detachments.includes(d.id)).flatMap((d) => d.enhancements.map((e) => e.id)),
    );

    const units = this.list.units.map((e) => ({
      ...e,
      enhancement: e.enhancement && offered.has(e.enhancement) ? e.enhancement : undefined,
      upgrade: e.upgrade && offered.has(e.upgrade) ? e.upgrade : undefined,
    }));

    // The chosen disposition goes when no remaining detachment has it.
    const dispositions = offeredDispositions(chosen);
    const kept = this.list.disposition;
    const disposition = kept && dispositions.includes(kept) ? kept : undefined;

    return this.with({ detachments, units, disposition });
  }

  /** Adds a unit at its smallest size. Returns the new draft and the new entry's id. */
  addUnit(library: Library, unitId: string): { draft: ArmyDraft; id: string } {
    const unit = library.unit(this.list.faction, unitId)?.unit;
    const models = Math.min(...(unit?.composition.points.map((p) => p.models) ?? [1]));
    let n = 1;

    while (this.entry(`${unitId}-${n}`)) n += 1;

    const id = `${unitId}-${n}`;

    return { draft: this.with({ units: [...this.list.units, { id, unit: unitId, models, wargear: [] }] }), id };
  }

  /** Removes a unit; units attached to it are detached and it stops being the warlord. */
  removeUnit(id: string): ArmyDraft {
    const units = this.list.units
      .filter((e) => e.id !== id)
      .map((e) => (e.attachedTo === id ? { ...e, attachedTo: undefined } : e));

    return this.with({ units, warlord: this.list.warlord === id ? undefined : this.list.warlord });
  }

  setModels(id: string, models: number): ArmyDraft {
    return this.withEntry(id, (e) => ({ ...e, models }));
  }

  /** Sets how many models take a wargear option and which list they take; 0 models removes the option. */
  /**
   * How many models take one choice of a wargear option. Other choices of the same option keep their own counts, so
   * two models can pick different weapons from one list; 0 removes that choice.
   */
  setWargear(id: string, option: string, models: number, choice: string[]): ArmyDraft {
    const same = (w: Wargear) => w.option === option && w.choice.join(',') === choice.join(',');

    return this.withEntry(id, (e) => {
      const others = e.wargear.filter((w) => !same(w));
      const row: Wargear = { option, models, choice };

      return { ...e, wargear: models > 0 ? [...others, row] : others };
    });
  }

  setEnhancement(id: string, enhancement: string | undefined): ArmyDraft {
    return this.withEntry(id, (e) => ({ ...e, enhancement }));
  }

  setUpgrade(id: string, upgrade: string | undefined): ArmyDraft {
    return this.withEntry(id, (e) => ({ ...e, upgrade }));
  }

  /** Attaches a leader or support unit to a bodyguard, or detaches it with `undefined`. */
  attach(id: string, bodyguard: string | undefined): ArmyDraft {
    return this.withEntry(id, (e) => ({ ...e, attachedTo: bodyguard }));
  }

  /**
   * Records the release of the faction's rules the list was last edited with (the hash), so the armies screen can say
   * when the rules changed since. The same draft when nothing changes.
   */
  withRelease(release: string | undefined): ArmyDraft {
    return release === this.list.release ? this : this.with({ release });
  }

  setWarlord(id: string | undefined): ArmyDraft {
    return this.with({ warlord: id });
  }
}
