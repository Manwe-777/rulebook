import type { MeleeWeapon, ModelLoadout, RangedWeapon, Unit } from '@rulebook/rules';

export interface WeaponRow<W> {
  weapon: W;
  /** How many of this weapon the unit carries; 0 when it carries none (shown only with "show all"). */
  count: number;
  /** The first profile of its weapon, where the count is shown; later profiles of the same weapon follow it. */
  first: boolean;
}

function rows<W extends RangedWeapon | MeleeWeapon>(weapons: W[], carried: Map<string, number>, showAll: boolean) {
  const seen = new Set<string>();

  return weapons
    .filter((w) => showAll || carried.has(w.id))
    .map((weapon) => {
      const first = !seen.has(weapon.id);

      seen.add(weapon.id);

      return { weapon, count: carried.get(weapon.id) ?? 0, first };
    });
}

/**
 * The weapon table rows for a unit as it was built: only the weapons its models carry, each with how many, or every
 * weapon on the datasheet when `showAll` is on.
 */
export function weaponRows(unit: Unit, loadout: ModelLoadout[], showAll: boolean) {
  const carried = new Map<string, number>();

  for (const item of loadout.flatMap((l) => l.items)) carried.set(item.id, (carried.get(item.id) ?? 0) + item.count);

  return {
    ranged: rows(unit.ranged, carried, showAll) as WeaponRow<RangedWeapon>[],
    melee: rows(unit.melee, carried, showAll) as WeaponRow<MeleeWeapon>[],
  };
}
