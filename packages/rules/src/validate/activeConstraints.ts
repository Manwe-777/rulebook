import type { Constraint } from '../types';
import { conditionHolds } from './conditionHolds';
import type { ValidationContext } from './types';

const applies = (ctx: ValidationContext, { when, unless }: Constraint) =>
  (!when || conditionHolds(ctx, when)) && ![unless ?? []].flat().some((c) => conditionHolds(ctx, c));

/** Each datasheet in the army once, for the rules it brings. */
function armyDatasheets(ctx: ValidationContext) {
  return [...new Map(ctx.entries.map((r) => [r.entry.unit, r.unit])).values()];
}

/**
 * The rules the datasheets in the army bring. A rule written the same way on several datasheets (a shared ally limit)
 * counts once, so a broken one is reported once.
 */
function datasheetConstraints(ctx: ValidationContext) {
  const found = new Map<string, { constraint: Constraint; source: string }>();

  for (const unit of armyDatasheets(ctx)) {
    for (const constraint of unit.constraints) {
      const key = JSON.stringify(constraint);

      if (!found.has(key)) found.set(key, { constraint, source: unit.id });
    }
  }

  return [...found.values()];
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
    ...datasheetConstraints(ctx),
  ];

  return all.filter(({ constraint }) => applies(ctx, constraint));
}
