import type { Library } from '../library/Library';
import type { ArmyList } from '../types';
import { armyPoints } from './armyPoints';
import { buildContext } from './buildContext';
import { entryPoints } from './entryPoints';

/** What a list costs in total and per entry, and its points limit. Unknown units count as 0. */
export function listPoints(
  list: ArmyList,
  library: Library,
): { total: number; limit: number | null; entries: Record<string, number> } {
  const { ctx } = buildContext(list, library);

  if (!ctx) return { total: 0, limit: null, entries: {} };

  return {
    total: armyPoints(ctx),
    limit: ctx.battleSize.points,
    entries: Object.fromEntries(ctx.entries.map((r) => [r.entry.id, entryPoints(ctx, r)])),
  };
}
