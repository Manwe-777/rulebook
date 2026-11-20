import { type ArmyList, type Enhancement, itemIneligibility, type Library, type Unit } from '@rulebook/rules';

/**
 * Enhancements (`model`) or upgrades (`unit`) from the list's chosen detachments that this unit can take. The one it
 * already has stays offered even when it no longer fits, so the choice stays visible until changed; the problem list
 * says why it is wrong.
 */
export function itemOptions(
  list: ArmyList,
  library: Library,
  target: Enhancement['target'],
  unit: Unit,
  current?: string,
): Enhancement[] {
  const detachments = library.armyDetachments(list.faction);

  return detachments
    .filter((d) => list.detachments.includes(d.id))
    .flatMap((d) => d.enhancements)
    .filter((e) => e.target === target)
    .filter((e) => e.id === current || itemIneligibility(e, unit, library.muster) === null);
}
