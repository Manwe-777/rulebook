import type { Weapon } from '@rulebook/rules';

/**
 * Flags weapons that are one of several profiles of the same weapon (two or more rows sharing a `group`). A `group`
 * used by a single row is just a label and is not flagged.
 */
export function markProfileGroups<T extends Weapon>(weapons: T[]): { weapon: T; inGroup: boolean }[] {
  const counts = new Map<string, number>();

  for (const w of weapons) if (w.group) counts.set(w.group, (counts.get(w.group) ?? 0) + 1);

  return weapons.map((weapon) => ({ weapon, inGroup: !!weapon.group && counts.get(weapon.group)! > 1 }));
}
