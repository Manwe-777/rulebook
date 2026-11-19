import type { ArmyList, ListEntry } from '../types';

/** A unit with the leaders and support units attached to it (empty for a unit on its own). */
export interface EntryGroup {
  unit: ListEntry;
  attached: ListEntry[];
}

/**
 * The army as it fights: each unit with what is attached to it, attached units listed first (they lead), in the order
 * the bodyguards were added. An entry attached to a unit that isn't in the list, or that is itself attached, stands
 * on its own.
 */
export function groupEntries(list: ArmyList): EntryGroup[] {
  const ids = new Set(list.units.map((e) => e.id));
  const byId = new Map(list.units.map((e) => [e.id, e]));

  const joins = (e: ListEntry) => {
    const target = e.attachedTo ? byId.get(e.attachedTo) : undefined;

    return Boolean(target && ids.has(target.id) && !target.attachedTo && target.id !== e.id);
  };

  return list.units
    .filter((e) => !joins(e))
    .map((unit) => ({ unit, attached: list.units.filter((e) => e.attachedTo === unit.id && joins(e)) }));
}
