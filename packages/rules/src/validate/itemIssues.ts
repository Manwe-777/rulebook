import type { Issue } from '../types';
import { findEnhancement } from './findEnhancement';
import { issue } from './issue';
import { itemIneligibility } from './itemIneligibility';
import type { Resolved, ValidationContext } from './types';

type Kind = 'enhancement' | 'upgrade';

function bearerIssues(ctx: ValidationContext, kind: Kind, { entry, unit }: Resolved, id: string): Issue[] {
  const item = findEnhancement(ctx, id);
  const target = kind === 'enhancement' ? 'model' : 'unit';

  if (!item) return [issue(`unknown-${kind}`, `"${id}" is not an ${kind} of a chosen detachment.`, [entry.id])];

  if (item.target !== target) {
    return [
      issue(`${kind}-kind`, `${item.name} is ${item.target === 'unit' ? 'an upgrade' : 'an enhancement'}.`, [entry.id]),
    ];
  }

  const problem = itemIneligibility(item, unit, { ...ctx.muster, enhancements: ctx.limits.enhancements });

  return problem ? [issue(`${kind}-bearer`, `${unit.name} can't take ${item.name}: it ${problem}.`, [entry.id])] : [];
}

/** Checks the enhancements or upgrades in a list: each exists, fits its bearer, is taken once and within the limit. */
export function itemIssues(ctx: ValidationContext, kind: Kind): Issue[] {
  const bearers = ctx.entries.flatMap((r) => (r.entry[kind] ? [{ r, id: r.entry[kind] }] : []));
  const issues = bearers.flatMap(({ r, id }) => bearerIssues(ctx, kind, r, id));
  const max = kind === 'enhancement' ? ctx.limits.enhancements.max : ctx.limits.upgrades.max;
  const ids = bearers.map((b) => b.id);
  // Upgrades, as soon as there are any, use up enhancement slots too.
  const upgradeSlots = ctx.entries.some((r) => r.entry.upgrade) ? ctx.limits.upgrades.enhancementSlots : 0;
  const used = kind === 'enhancement' ? ids.length + upgradeSlots : ids.length;

  for (const id of new Set(ids)) {
    const holders = bearers.filter((b) => b.id === id).map((b) => b.r.entry.id);

    if (holders.length > 1) issues.push(issue(`${kind}-twice`, `"${id}" is taken more than once.`, holders));
  }

  if (used > max) {
    const note = used > ids.length ? ` (upgrades use ${upgradeSlots} of them)` : '';

    issues.push(issue(`${kind}-limit`, `The army uses ${used} ${kind} slots${note}; at most ${max} are allowed.`));
  }

  return issues;
}
