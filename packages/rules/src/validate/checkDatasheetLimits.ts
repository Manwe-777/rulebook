import type { Muster, Unit } from '../types';
import { issue } from './issue';
import type { Check, Resolved } from './types';

function limitFor(unit: Unit, limits: Muster['datasheetLimits']): number {
  const rule = limits.find((l) => l.role === 'default' || unit.roles.includes(l.role));

  return rule?.max ?? Infinity;
}

/** Copies of each datasheet stay within the first muster limit matching one of its roles. */
export const checkDatasheetLimits: Check = (ctx) => {
  const groups = new Map<string, Resolved[]>();

  for (const r of ctx.entries) {
    if (!ctx.allowed['datasheet-limit'].has(r.entry.id))
      groups.set(r.entry.unit, [...(groups.get(r.entry.unit) ?? []), r]);
  }

  return [...groups.values()].flatMap((group) => {
    const max = limitFor(group[0].unit, ctx.limits.datasheetLimits);

    if (group.length <= max) return [];

    return [
      issue(
        'datasheet-limit',
        `${group[0].unit.name} is taken ${group.length} times; at most ${max} are allowed.`,
        group.map((r) => r.entry.id),
      ),
    ];
  });
};
