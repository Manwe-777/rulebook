import type { Selector } from '../types';
import { matchesUnit } from './matchesUnit';
import type { Resolved, ValidationContext } from './types';

/** Bodyguard entries with an attached unit that matches the filter. */
function hasAttached(ctx: ValidationContext, bodyguard: Resolved, filter: NonNullable<Selector['attached']>) {
  return ctx.entries.some((r) => r.entry.attachedTo === bodyguard.entry.id && matchesUnit(r.unit, filter));
}

/** The list entries a constraint selector picks. Every given field must match. */
export function selectEntries(ctx: ValidationContext, selector: Selector): Resolved[] {
  return ctx.entries.filter((r) => {
    const tests = [
      !selector.units || matchesUnit(r.unit, selector.units),
      !selector.enhancements || selector.enhancements.ids.includes(r.entry.enhancement ?? ''),
      !selector.upgrades || selector.upgrades.ids.includes(r.entry.upgrade ?? ''),
      !selector.attached || hasAttached(ctx, r, selector.attached),
      selector.warlord === undefined || (ctx.list.warlord === r.entry.id) === selector.warlord,
    ];

    return tests.every(Boolean);
  });
}
