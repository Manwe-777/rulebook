import type { ArmyList, Library, ListEntry } from '@rulebook/rules';

/**
 * How a bodyguard unit is named where a leader picks it: its datasheet name, its number among the army's copies of that
 * datasheet when there are several, its model count, and the units already joined to it (other than `self`), e.g.
 * `Sanguinary Guard 2 · 6 models · with Commander Dante`.
 */
export function bodyguardLabel(list: ArmyList, library: Library, target: ListEntry, self?: string): string {
  const name = (e: ListEntry) => library.unit(list.faction, e.unit)?.unit.name ?? e.unit;
  const copies = list.units.filter((e) => e.unit === target.unit);
  const joined = list.units.filter((e) => e.attachedTo === target.id && e.id !== self);

  return [
    copies.length > 1 ? `${name(target)} ${copies.indexOf(target) + 1}` : name(target),
    `${target.models} model${target.models === 1 ? '' : 's'}`,
    joined.length > 0 ? `with ${joined.map(name).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}
