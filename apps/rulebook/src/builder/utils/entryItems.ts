import type { ArmyList, Enhancement, Library, ListEntry } from '@rulebook/rules';

/** The enhancement and upgrade an entry took, with their rules, from the army's detachments. */
export function entryItems(library: Library, list: ArmyList, entry: ListEntry): Enhancement[] {
  const items = library
    .armyDetachments(list.faction)
    .filter((d) => list.detachments.includes(d.id))
    .flatMap((d) => d.enhancements);

  return [entry.enhancement, entry.upgrade].flatMap((id) => items.find((e) => e.id === id) ?? []);
}
