import { hasKeywords } from './hasKeywords';
import { issue } from './issue';
import type { Resolved, ValidationContext } from './types';
import type { Check } from './types';

/**
 * Whether the army's faction can take this entry's datasheet: an id of its own, or `faction/id` naming a faction it
 * includes (and doesn't exclude the datasheet from).
 */
function inArmy(ctx: ValidationContext, r: Resolved): boolean {
  const [faction, id] = r.entry.unit.split('/');

  return id === undefined || ctx.library.unit(ctx.faction.id, id)?.faction.id === faction;
}

function factionIssue(ctx: ValidationContext, r: Resolved) {
  if (!inArmy(ctx, r))
    return issue('wrong-faction', `${r.unit.name} can't join a ${ctx.faction.name} army.`, [r.entry.id]);

  if (!hasKeywords(r.unit, [ctx.faction.factionKeyword]))
    return issue('wrong-faction', `${r.unit.name} is not a ${ctx.faction.factionKeyword} unit.`, [r.entry.id]);

  return undefined;
}

/**
 * Every unit comes from the army's faction or a faction it includes, and carries the army's faction keyword, unless a
 * constraint allows it (allies).
 */
export const checkFaction: Check = (ctx) =>
  ctx.entries.filter((r) => !ctx.allowed.faction.has(r.entry.id)).flatMap((r) => factionIssue(ctx, r) ?? []);
