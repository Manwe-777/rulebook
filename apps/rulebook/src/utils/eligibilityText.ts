import type { Enhancement } from '@rulebook/rules';

/**
 * Who can take an enhancement: `FIELD CAPTAIN model only`, `IRON-MASTER or MEMNYR STRATEGIST model only`,
 * `VEHICLE unit only (not TITANIC)`.
 */
export function eligibilityText(enhancement: Enhancement): string {
  const all = enhancement.keywords.join(' ');
  const any = enhancement.anyKeywords.join(' or ');

  const who = [all, any]
    .filter(Boolean)
    .map((w) => `${w} `)
    .join('');

  const excluded = [...enhancement.excludeKeywords, ...enhancement.excludeRoles.map((r) => r.replace('-', ' '))];
  const not = excluded.length ? ` (not ${excluded.join(', ').toUpperCase()})` : '';

  return `${who}${enhancement.target} only${not}`;
}
