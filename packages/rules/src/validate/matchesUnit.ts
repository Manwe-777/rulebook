import type { Selector, Unit } from '../types';
import { hasKeywords } from './hasKeywords';

type UnitFilter = NonNullable<Selector['units']>;

/** Whether a unit matches a selector's unit filter. Every given field must match; `not` inverts the result. */
export function matchesUnit(unit: Unit, filter: UnitFilter): boolean {
  const tests = [
    !filter.ids || filter.ids.includes(unit.id),
    !filter.keywords || hasKeywords(unit, filter.keywords),
    !filter.anyKeywords || hasKeywords(unit, filter.anyKeywords, true),
    !filter.roles || filter.roles.some((r) => unit.roles.includes(r)),
  ];

  return tests.every(Boolean) !== Boolean(filter.not);
}
