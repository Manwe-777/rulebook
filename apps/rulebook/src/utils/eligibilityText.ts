import type { Enhancement } from '@rulebook/rules';

/** Who can take an enhancement: `FIELD CAPTAIN model only`, `VEHICLE unit only (not TITANIC)`. */
export function eligibilityText(enhancement: Enhancement): string {
  const who = enhancement.keywords.length ? `${enhancement.keywords.join(' ')} ` : '';
  const excluded = [...enhancement.excludeKeywords, ...enhancement.excludeRoles.map((r) => r.replace('-', ' '))];
  const not = excluded.length ? ` (not ${excluded.join(', ').toUpperCase()})` : '';

  return `${who}${enhancement.target} only${not}`;
}
