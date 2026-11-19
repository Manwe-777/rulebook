import type { Constraint } from '../types';
import { entryPoints } from './entryPoints';
import { selectEntries } from './selectEntries';
import type { Resolved, ValidationContext } from './types';

function measure(ctx: ValidationContext, entries: Resolved[], kind: Constraint['measure']): number {
  if (kind === 'count') return entries.length;
  if (kind === 'models') return entries.reduce((sum, r) => sum + r.entry.models, 0);

  return entries.reduce((sum, r) => sum + entryPoints(ctx, r), 0);
}

/** Selects a constraint's entries and compares their measure: `ok` is false when a comparison fails. */
export function constraintHolds(ctx: ValidationContext, constraint: Constraint): { ok: boolean; selected: Resolved[] } {
  const selected = selectEntries(ctx, constraint.select);
  const value = measure(ctx, selected, constraint.measure);
  const { min, max, equal, maxShare } = constraint;

  const ok =
    (min === undefined || value >= min) &&
    (max === undefined || value <= max) &&
    (equal === undefined || value === equal) &&
    (maxShare === undefined || value <= maxShare * ctx.battleSize.points);

  return { ok, selected };
}
