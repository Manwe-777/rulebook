import type { ArmyList, Library, ListEntry } from '@rulebook/rules';

/** List entries a leader or support entry can join: bodyguards named on its datasheet that aren't attached themselves. */
export function attachTargets(list: ArmyList, library: Library, entry: ListEntry): ListEntry[] {
  const unit = library.unit(list.faction, entry.unit)?.unit;
  const bodyguards = [...(unit?.leader?.bodyguards ?? []), ...(unit?.support?.bodyguards ?? [])];

  return list.units.filter((e) => e.id !== entry.id && !e.attachedTo && bodyguards.includes(e.unit));
}
