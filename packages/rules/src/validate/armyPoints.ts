import { entryPoints } from './entryPoints';
import type { ValidationContext } from './types';

/** Total cost of the army in points: every entry. Detachments cost detachment points, not points. */
export function armyPoints(ctx: ValidationContext): number {
  return ctx.entries.reduce((sum, r) => sum + entryPoints(ctx, r), 0);
}
