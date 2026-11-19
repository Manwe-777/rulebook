import { tally, type Unit, wargearName } from '@rulebook/rules';

/**
 * Default wargear per model type, repeated items counted:
 * `{ model: 'Hekaton Land Fortress', items: 'Cyclic ion cannon; 2 × Twin bolt cannon' }`.
 */
export function equipmentLines(unit: Unit): { model: string; items: string }[] {
  return Object.entries(unit.composition.wargear).map(([model, ids]) => ({
    model,
    items: tally(ids)
      .map(({ id, count }) => `${count > 1 ? `${count} × ` : ''}${wargearName(unit, id)}`)
      .join('; '),
  }));
}
