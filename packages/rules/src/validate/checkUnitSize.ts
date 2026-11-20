import type { ListEntry, Unit } from '../types';
import { entrySize } from '../utils/entrySize';
import { sizeLabel } from '../utils/sizeLabel';
import { unitSizes } from '../utils/unitSizes';
import { issue } from './issue';
import type { Check } from './types';

function sizeMessage(unit: Unit, entry: ListEntry): string {
  const sizes = unitSizes(unit);

  if (!entry.counts) {
    return `${unit.name} has ${entry.models} models; it can have ${[...new Set(sizes.map((s) => s.models))].join(' or ')}.`;
  }

  const given = Object.entries(entry.counts)
    .filter(([, n]) => n > 0)
    .map(([type, n]) => `${n} ${type}`)
    .join(', ');

  return `${unit.name} can't be ${given}; it can be ${sizes.map((s) => sizeLabel(s)).join(' or ')}.`;
}

/** Each entry has one of its unit's sizes, and the model counts of that size when it gives them. */
export const checkUnitSize: Check = (ctx) =>
  ctx.entries.flatMap(({ entry, unit }) =>
    entrySize(unit, entry) ? [] : [issue('unit-size', sizeMessage(unit, entry), [entry.id])],
  );
