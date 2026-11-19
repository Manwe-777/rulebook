import type { Constraint } from '../types';
import { selectEntries } from './selectEntries';
import type { ValidationContext } from './types';

function applies(ctx: ValidationContext, when: Constraint['when']): boolean {
  if (!when) return true;

  return (
    (!when.detachment || ctx.detachments.some((d) => d.id === when.detachment)) &&
    (!when.battleSize || ctx.battleSize.id === when.battleSize) &&
    (!when.has || selectEntries(ctx, when.has).length > 0)
  );
}

/** Every constraint from the muster rules, the faction and the chosen detachments whose `when` holds. */
export function activeConstraints(ctx: ValidationContext): { constraint: Constraint; source: string }[] {
  const all = [
    ...ctx.muster.constraints.map((constraint) => ({ constraint, source: 'core' })),
    ...ctx.faction.constraints.map((constraint) => ({ constraint, source: ctx.faction.id })),
    ...ctx.detachments.flatMap((d) => d.constraints.map((constraint) => ({ constraint, source: d.id }))),
  ];

  return all.filter(({ constraint }) => applies(ctx, constraint.when));
}
