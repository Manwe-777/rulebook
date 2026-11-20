import type { Constraint } from '../types';
import { conditionHolds } from './conditionHolds';
import type { ValidationContext } from './types';

const applies = (ctx: ValidationContext, { when, unless }: Constraint) =>
  (!when || conditionHolds(ctx, when)) && !(unless && conditionHolds(ctx, unless));

/** Each datasheet in the army once, for the rules it brings. */
function armyDatasheets(ctx: ValidationContext) {
  return [...new Map(ctx.entries.map((r) => [r.entry.unit, r.unit])).values()];
}

/**
 * Every constraint from the muster rules, the faction, the chosen detachments and the datasheets in the army whose
 * `when` holds and `unless` doesn't.
 */
export function activeConstraints(ctx: ValidationContext): { constraint: Constraint; source: string }[] {
  const all = [
    ...ctx.muster.constraints.map((constraint) => ({ constraint, source: 'core' })),
    ...ctx.faction.constraints.map((constraint) => ({ constraint, source: ctx.faction.id })),
    ...ctx.detachments.flatMap((d) => d.constraints.map((constraint) => ({ constraint, source: d.id }))),
    ...armyDatasheets(ctx).flatMap((u) => u.constraints.map((constraint) => ({ constraint, source: u.id }))),
  ];

  return all.filter(({ constraint }) => applies(ctx, constraint));
}
