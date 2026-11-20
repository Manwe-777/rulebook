import type { ArmyList } from '@rulebook/rules';

/** How many entries of this datasheet the army has. */
export function unitCopies(list: ArmyList, unitId: string): number {
  return list.units.filter((e) => e.unit === unitId).length;
}
