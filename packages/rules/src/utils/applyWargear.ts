import type { ListEntry, Unit } from '../types';
import { entrySize } from './entrySize';
import { modelCounts } from './modelCounts';

/** What one model type in a unit carries in total: `{ type: 'Hesyr', count: 1, items: [{ id: 'teleport-crest', count: 1 }] }`. */
export interface ModelLoadout {
  type: string;
  count: number;
  items: { id: string; count: number }[];
}

type Carried = Map<string, number>;

const add = (carried: Carried, id: string, n: number) => {
  const total = (carried.get(id) ?? 0) + n;

  if (total > 0) carried.set(id, total);
  else carried.delete(id);
};

/** How many models of a type can still take a choice: those carrying everything it replaces, or all for an addition. */
const room = (carried: Carried, count: number, replace: string[]) =>
  replace.length ? Math.min(...replace.map((id) => carried.get(id) ?? 0)) : count;

/** A chosen wargear row that couldn't be applied to every model it names: too few models still carried what it replaces. */
export interface Shortfall {
  option: string;
  choice: string[];
  missing: number;
}

/**
 * The entry's choices with their options, those for a named model type first (they have fewer models to go to), each
 * group in list order.
 */
function inApplyOrder(unit: Unit, entry: ListEntry) {
  const rows = entry.wargear.flatMap((row) => {
    const option = unit.wargearOptions.find((o) => o.id === row.option);

    return option ? [{ row, option }] : [];
  });

  return [...rows.filter((r) => r.option.models), ...rows.filter((r) => !r.option.models)];
}

/**
 * Applies a list entry's wargear choices to its models' default wargear, and reports the choices that
 * found too few models still carrying what they replace. An option for a named model type changes that type; any other
 * goes to the types that still carry what it replaces, rank and file (the last types) first.
 */
export function applyWargear(unit: Unit, entry: ListEntry): { loadout: ModelLoadout[]; shortfalls: Shortfall[] } {
  const counts = entrySize(unit, entry)?.counts ?? modelCounts(unit, entry.models);

  const groups = counts.map(({ type, count }) => {
    const carried: Carried = new Map();

    for (const id of unit.composition.wargear[type] ?? []) add(carried, id, count);

    return { type, count, carried };
  });

  const shortfalls: Shortfall[] = [];

  for (const { row, option } of inApplyOrder(unit, entry)) {
    const targets = option.models ? groups.filter((g) => g.type === option.models) : [...groups].reverse();
    let left = row.models;

    for (const group of targets) {
      const n = Math.min(left, room(group.carried, group.count, option.replace));

      for (const id of option.replace) add(group.carried, id, -n);
      for (const id of row.choice) add(group.carried, id, n);
      left -= n;
    }

    if (left > 0) shortfalls.push({ option: row.option, choice: row.choice, missing: left });
  }

  const loadout = groups.map(({ type, count, carried }) => ({
    type,
    count,
    items: [...carried].map(([id, n]) => ({ id, count: n })),
  }));

  return { loadout, shortfalls };
}
