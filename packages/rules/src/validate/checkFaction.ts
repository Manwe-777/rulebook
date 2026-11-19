import { hasKeywords } from './hasKeywords';
import { issue } from './issue';
import type { Check } from './types';

/** Every unit carries the army's faction keyword, unless a constraint allows it. */
export const checkFaction: Check = (ctx) =>
  ctx.entries
    .filter((r) => !ctx.allowed.faction.has(r.entry.id) && !hasKeywords(r.unit, [ctx.faction.factionKeyword]))
    .map((r) => issue('wrong-faction', `${r.unit.name} is not a ${ctx.faction.factionKeyword} unit.`, [r.entry.id]));
