import type { ListEntry, Unit } from '../types';
import { type UnitSize, unitSizes } from './unitSizes';

/**
 * The size a list entry is taken at: the one with its model counts when it gives them, otherwise the first one with its
 * number of models. Undefined when the unit has no such size.
 */
export function entrySize(unit: Unit, entry: Pick<ListEntry, 'models' | 'counts'>): UnitSize | undefined {
  const sizes = unitSizes(unit).filter((s) => s.models === entry.models);
  const counts = entry.counts;

  if (!counts) return sizes[0];

  return sizes.find((s) => s.counts.every((c) => c.count === (counts[c.type] ?? 0)));
}
