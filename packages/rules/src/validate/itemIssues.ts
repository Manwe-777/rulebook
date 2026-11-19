import type { Enhancement, Issue, Role, Unit } from '../types';
import { findEnhancement } from './findEnhancement';
import { hasKeywords } from './hasKeywords';
import { issue } from './issue';
import type { Resolved, ValidationContext } from './types';

type Kind = 'enhancement' | 'upgrade';

/** Why a unit can't take an item, or null when it can. */
function ineligible(item: Enhancement, unit: Unit, roles: Role[], excludeRoles: Role[]): string | null {
  if (roles.length && !roles.some((r) => unit.roles.includes(r))) return `needs a ${roles.join(' or ')} unit`;
  if (!hasKeywords(unit, item.keywords)) return `needs ${item.keywords.join(', ')}`;

  if (item.excludeKeywords.length && hasKeywords(unit, item.excludeKeywords, true)) {
    return `can't go on ${item.excludeKeywords.join(' or ')} units`;
  }

  if ([...item.excludeRoles, ...excludeRoles].some((r) => unit.roles.includes(r)))
    return "can't go on this kind of unit";

  return null;
}

function bearerIssues(ctx: ValidationContext, kind: Kind, { entry, unit }: Resolved, id: string): Issue[] {
  const item = findEnhancement(ctx, id);
  const target = kind === 'enhancement' ? 'model' : 'unit';
  const rules = kind === 'enhancement' ? ctx.limits.enhancements : { roles: [], excludeRoles: [] };

  if (!item) return [issue(`unknown-${kind}`, `"${id}" is not an ${kind} of a chosen detachment.`, [entry.id])];

  if (item.target !== target) {
    return [
      issue(`${kind}-kind`, `${item.name} is ${item.target === 'unit' ? 'an upgrade' : 'an enhancement'}.`, [entry.id]),
    ];
  }

  const problem = ineligible(item, unit, rules.roles, rules.excludeRoles);

  return problem ? [issue(`${kind}-bearer`, `${unit.name} can't take ${item.name}: it ${problem}.`, [entry.id])] : [];
}

/** Checks the enhancements or upgrades in a list: each exists, fits its bearer, is taken once and within the limit. */
export function itemIssues(ctx: ValidationContext, kind: Kind): Issue[] {
  const bearers = ctx.entries.flatMap((r) => (r.entry[kind] ? [{ r, id: r.entry[kind] }] : []));
  const issues = bearers.flatMap(({ r, id }) => bearerIssues(ctx, kind, r, id));
  const max = kind === 'enhancement' ? ctx.limits.enhancements.max : ctx.limits.upgrades.max;
  const ids = bearers.map((b) => b.id);

  for (const id of new Set(ids)) {
    const holders = bearers.filter((b) => b.id === id).map((b) => b.r.entry.id);

    if (holders.length > 1) issues.push(issue(`${kind}-twice`, `"${id}" is taken more than once.`, holders));
  }

  if (ids.length > max) {
    issues.push(issue(`${kind}-limit`, `The army has ${ids.length} ${kind}s; at most ${max} are allowed.`));
  }

  return issues;
}
