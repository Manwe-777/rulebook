import type { Library } from '../library/Library';
import type { ArmyList, Unit } from '../types';
import { buildContext } from './buildContext';

/**
 * Each entry's datasheet as the army uses it: with the roles and keywords its detachments grant. Entries whose unit
 * is unknown are left out.
 */
export function grantedUnits(list: ArmyList, library: Library): Map<string, Unit> {
  const { ctx } = buildContext(list, library);

  return new Map((ctx?.entries ?? []).map((r) => [r.entry.id, r.unit]));
}
