import { entryPoints } from './entryPoints';
import type { ValidationContext } from './types';

/** Total cost of the army: every entry plus its detachments. */
export function armyPoints(ctx: ValidationContext): number {
  const units = ctx.entries.reduce((sum, r) => sum + entryPoints(ctx, r), 0);

  return units + ctx.detachments.reduce((sum, d) => sum + d.points, 0);
}
