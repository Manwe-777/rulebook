import type { Enhancement, Muster, Role, Unit } from '../types';
import { hasKeywords } from './hasKeywords';

/** The item's own keyword rules: all of `keywords`, one of `anyKeywords`, none of `excludeKeywords`. */
function keywordProblem(item: Enhancement, unit: Unit): string | null {
  if (!hasKeywords(unit, item.keywords)) return `needs ${item.keywords.join(', ')}`;

  if (item.anyKeywords.length && !hasKeywords(unit, item.anyKeywords, true)) {
    return `needs ${item.anyKeywords.join(' or ')}`;
  }

  if (item.excludeKeywords.length && hasKeywords(unit, item.excludeKeywords, true)) {
    return `can't go on ${item.excludeKeywords.join(' or ')} units`;
  }

  return null;
}

/**
 * Why a unit can't take an enhancement or upgrade, or null when it can: the muster rules' roles for enhancements, the
 * item's keywords, and the roles that rule it out.
 */
export function itemIneligibility(item: Enhancement, unit: Unit, muster: Muster | undefined): string | null {
  const rules = item.target === 'model' && muster ? muster.enhancements : { roles: [] as Role[], excludeRoles: [] };

  if (rules.roles.length && !rules.roles.some((r) => unit.roles.includes(r))) {
    return `needs a ${rules.roles.join(' or ')} unit`;
  }

  const problem = keywordProblem(item, unit);

  if (problem) return problem;

  return [...item.excludeRoles, ...rules.excludeRoles].some((r) => unit.roles.includes(r))
    ? "can't go on this kind of unit"
    : null;
}
