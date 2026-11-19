import type { Issue } from '../types';
import { entryPoints } from './entryPoints';
import { issue } from './issue';
import { transportIssues } from './transportIssues';
import type { Check } from './types';

/** When the list declares its battle formation: reserves stay within their share, transports carry what fits. */
export const checkFormation: Check = (ctx) => {
  const formation = ctx.list.formation;

  if (!formation) return [];

  const issues: Issue[] = Object.entries(formation.embarked).flatMap(([t, ids]) => transportIssues(ctx, t, ids));
  const passengers = Object.values(formation.embarked).flat();

  for (const id of new Set(passengers)) {
    if (passengers.filter((p) => p === id).length > 1)
      issues.push(issue('embarked-twice', `"${id}" is embarked twice.`, [id]));
  }

  const inReserve = new Set(formation.reserves.flatMap((id) => [id, ...(formation.embarked[id] ?? [])]));

  const points = [...inReserve].reduce(
    (sum, id) => sum + (ctx.byId.has(id) ? entryPoints(ctx, ctx.byId.get(id)!) : 0),
    0,
  );

  const limit = ctx.muster.strategicReserves.maxShare * ctx.battleSize.points;

  if (points > limit) {
    issues.push(
      issue('reserves-limit', `${points} points are in Strategic Reserves; at most ${limit} can be.`, [...inReserve]),
    );
  }

  return issues;
};
