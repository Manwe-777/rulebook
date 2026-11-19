import type { Unit } from '../types';

/**
 * Display name of a wargear id on a unit: a weapon's group for multi-profile weapons, else its name, or an equipment
 * item's name; the id itself when the unit has nothing by that id.
 */
export function wargearName(unit: Unit, id: string): string {
  const weapon = [...unit.ranged, ...unit.melee].find((w) => w.id === id);

  if (weapon) return weapon.group ?? weapon.name;

  return unit.equipment.find((e) => e.id === id)?.name ?? id;
}
