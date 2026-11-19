import type { Unit } from '@rulebook/rules';

/** Display name of a weapon id on a unit: its group for multi-profile weapons, else its name; the id if unknown. */
export function weaponName(unit: Unit, id: string): string {
  const weapon = [...unit.ranged, ...unit.melee].find((w) => w.id === id);

  return weapon ? (weapon.group ?? weapon.name) : id;
}
