import type { ArmyList, ListEntry } from '@rulebook/rules';

/** The bodyguard an entry belongs to (itself when not attached) and the units attached to it, in list order. */
export function combinedUnit(list: ArmyList, entryId: string): { bodyguard: ListEntry; attached: ListEntry[] } | null {
  const entry = list.units.find((u) => u.id === entryId);

  if (!entry) return null;

  const bodyguard = (entry.attachedTo && list.units.find((u) => u.id === entry.attachedTo)) || entry;

  return { bodyguard, attached: list.units.filter((u) => u.attachedTo === bodyguard.id) };
}
