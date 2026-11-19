import type { Library } from '../library/Library';
import type { ArmyList, BattleSize, Detachment, Faction, Issue, ListEntry, Muster, Unit } from '../types';

/** Core checks a constraint with `allow` can lift for the entries it selects. */
export type AllowKind = 'faction' | 'datasheet-limit' | 'attachments';

/** A list entry whose unit was found. */
export interface Resolved {
  entry: ListEntry;
  unit: Unit;
}

/** Muster limits after the battle size's overrides. */
export type Limits = Pick<Muster, 'detachments' | 'datasheetLimits' | 'enhancements' | 'upgrades'>;

/** Everything the checks need, with every reference already resolved. */
export interface ValidationContext {
  list: ArmyList;
  library: Library;
  faction: Faction;
  muster: Muster;
  battleSize: BattleSize;
  limits: Limits;
  detachments: Detachment[];
  /** Entries whose unit exists, in list order. */
  entries: Resolved[];
  byId: Map<string, Resolved>;
  /** Entry ids exempt from a core check because a constraint allows them. */
  allowed: Record<AllowKind, Set<string>>;
}

export type Check = (ctx: ValidationContext) => Issue[];
