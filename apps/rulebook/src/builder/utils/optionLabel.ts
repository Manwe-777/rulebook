import { type Unit, wargearName, type WargearOption } from '@rulebook/rules';

/**
 * A wargear option's heading in the builder: what it swaps or that it adds, naming the model type when the unit has
 * several (`Theyn: swap Autoch-pattern bolter`).
 */
export function optionLabel(unit: Unit, option: WargearOption): string {
  const names = option.replace.map((id) => wargearName(unit, id)).join(' + ');
  const action = names ? `swap ${names}` : 'add';
  const who = option.models && unit.composition.models.length > 1 ? `${option.models}: ` : '';
  const text = `${who}${action}`;

  return text.charAt(0).toUpperCase() + text.slice(1);
}
