import type { ListEntry, Unit } from '../types';
import { applyWargear, type ModelLoadout } from './applyWargear';

export type { ModelLoadout };

/** Everything a list entry's models carry: the datasheet's default wargear for each model type, with its choices applied. */
export function entryLoadout(unit: Unit, entry: ListEntry): ModelLoadout[] {
  return applyWargear(unit, entry).loadout;
}
