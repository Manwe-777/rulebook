import { type ModelLoadout, type Unit, wargearName } from '@rulebook/rules';

/**
 * What each model type carries, in words: `9 Hearthkyn Warrior: Autoch-pattern bolt pistol, 7 × Ion blaster, …`. An
 * item every model of the type carries is named alone; one only some carry gets its count.
 */
export function loadoutLines(unit: Unit, loadout: ModelLoadout[]): string[] {
  return loadout
    .filter((l) => l.count > 0)
    .map(({ type, count, items }) => {
      const names = items.map((i) => (i.count === count ? '' : `${i.count} × `) + wargearName(unit, i.id));

      return `${count} ${type}: ${names.join(', ') || 'nothing'}`;
    });
}
