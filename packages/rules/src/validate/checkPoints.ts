import { armyPoints } from './armyPoints';
import { issue } from './issue';
import type { Check } from './types';

/** The army costs no more than the battle size allows. */
export const checkPoints: Check = (ctx) => {
  const total = armyPoints(ctx);
  const limit = ctx.battleSize.points;

  if (total <= limit) return [];

  return [issue('points-over-limit', `The army costs ${total} points; ${ctx.battleSize.name} allows ${limit}.`)];
};
