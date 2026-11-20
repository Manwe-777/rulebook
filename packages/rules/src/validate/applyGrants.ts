import type { Detachment } from '../types';
import { matchesUnit } from './matchesUnit';
import type { Resolved } from './types';

/**
 * The entries with what the chosen detachments grant: each grant adds its roles and keywords to the units it selects,
 * in list order, up to its `max`. Units are copied, never changed in place.
 */
export function applyGrants(entries: Resolved[], detachments: Detachment[]): Resolved[] {
  let result = entries;

  for (const grant of detachments.flatMap((d) => d.grants)) {
    let given = 0;

    result = result.map((r) => {
      if (!matchesUnit(r.unit, grant.units) || (grant.max !== undefined && given >= grant.max)) return r;

      given++;

      const unit = {
        ...r.unit,
        roles: [...new Set([...r.unit.roles, ...grant.roles])],
        keywords: [...new Set([...r.unit.keywords, ...grant.keywords])],
      };

      return { ...r, unit };
    });
  }

  return result;
}
