import { type Unit, wargearName } from '@rulebook/rules';

/** Default wargear per model type: `{ model: 'Sergeant', items: 'Service pistol; Close combat weapon' }`. */
export function equipmentLines(unit: Unit): { model: string; items: string }[] {
  return Object.entries(unit.composition.wargear).map(([model, ids]) => ({
    model,
    items: ids.map((id) => wargearName(unit, id)).join('; '),
  }));
}
