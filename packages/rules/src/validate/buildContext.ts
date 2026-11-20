import type { Library } from '../library/Library';
import type { ArmyList, Detachment, Issue } from '../types';
import { applyGrants } from './applyGrants';
import { issue } from './issue';
import { resolveUnit } from './resolveUnit';
import type { Resolved, ValidationContext } from './types';

function resolveDetachments(list: ArmyList, available: Detachment[], issues: Issue[]): Detachment[] {
  return list.detachments.flatMap((id) => {
    const found = available.find((d) => d.id === id);

    if (!found) issues.push(issue('unknown-detachment', `There is no detachment "${id}" in this faction.`));

    return found ? [found] : [];
  });
}

function resolveEntries(list: ArmyList, library: Library, issues: Issue[]): Resolved[] {
  const seen = new Set<string>();
  const copies = new Map<string, number>();

  return list.units.flatMap((entry) => {
    const unit = resolveUnit(library, list.faction, entry.unit);

    if (seen.has(entry.id))
      issues.push(issue('duplicate-entry', `Two entries share the id "${entry.id}".`, [entry.id]));
    seen.add(entry.id);

    if (!unit) issues.push(issue('unknown-unit', `There is no unit "${entry.unit}".`, [entry.id]));

    if (!unit) return [];

    const copy = (copies.get(unit.id) ?? 0) + 1;

    copies.set(unit.id, copy);

    return [{ entry, unit, copy }];
  });
}

/**
 * Resolves every reference in a list. Returns the context for the checks, or null when the list can't be checked at
 * all (unknown faction, battle size or missing muster rules), together with the issues found so far.
 */
export function buildContext(list: ArmyList, library: Library): { ctx: ValidationContext | null; issues: Issue[] } {
  const issues: Issue[] = [];
  const faction = library.faction(list.faction);
  const muster = library.muster;
  const battleSize = muster?.battleSizes.find((b) => b.id === list.battleSize);

  if (!muster) issues.push(issue('no-muster-rules', 'The muster rules are missing, so the list cannot be checked.'));
  if (!faction) issues.push(issue('unknown-faction', `There is no faction "${list.faction}".`));
  if (muster && !battleSize) issues.push(issue('unknown-battle-size', `There is no battle size "${list.battleSize}".`));
  if (!faction || !muster || !battleSize) return { ctx: null, issues };

  const resolved = resolveEntries(list, library, issues);
  const chosen = resolveDetachments(list, library.armyDetachments(faction.id), issues);
  // Roles and keywords from the detachments count for every check (datasheet limits, enhancements, warlord).
  const entries = applyGrants(resolved, chosen);

  const { detachments, detachmentPoints, datasheetLimits, enhancements, upgrades } = {
    ...muster,
    ...battleSize.overrides,
  };

  const ctx: ValidationContext = {
    list,
    library,
    faction,
    muster,
    battleSize,
    limits: { detachments, detachmentPoints, datasheetLimits, enhancements, upgrades },
    detachments: chosen,
    entries,
    byId: new Map(entries.map((r) => [r.entry.id, r])),
    allowed: { faction: new Set(), 'datasheet-limit': new Set(), attachments: new Set() },
  };

  return { ctx, issues };
}
