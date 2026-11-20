import type { Library } from '../library/Library';
import type { Faction, Issue } from '../types';
import { constraintIssues } from './constraintIssues';
import { detachmentIssues } from './detachmentIssues';
import { unitIssues } from './unitIssues';

function musterIssues(library: Library): Issue[] {
  const muster = library.muster;

  const issue = (code: string, message: string): Issue => ({
    code,
    severity: 'error',
    message,
    entries: ['core'],
    source: 'core',
  });

  if (!muster) return [issue('no-muster-rules', 'There are no muster rules in the core folder.')];

  return muster.datasheetLimits.some((l) => l.role === 'default')
    ? []
    : [
        {
          ...issue('no-default-limit', 'The datasheet limits have no default entry, so most units have no limit.'),
          severity: 'warning',
        },
      ];
}

/**
 * Checks that every faction's records are consistent with each other and with the core data. Entries name records as
 * `faction/id`. Errors block a release; warnings don't. Never throws.
 */
export function checkDataset(library: Library): Issue[] {
  return [
    ...musterIssues(library),
    ...library.factions.flatMap((faction) => {
      // References may name records of included factions, and of the factions that include this one (a shared
      // datasheet can name the chapter units it leads).
      const reach: Faction = {
        ...faction,
        units: [...library.armyUnits(faction.id), ...library.includedBy(faction.id).flatMap((f) => f.units)],
        detachments: library.armyDetachments(faction.id),
      };

      return [
        ...includeIssues(library, faction),
        ...constraintIssues(reach, faction.constraints, faction.id),
        ...faction.units.flatMap((unit) => unitIssues(reach, unit)),
        ...faction.detachments.flatMap((detachment) => detachmentIssues(reach, detachment, library.muster)),
      ];
    }),
  ];
}

/** Included factions that don't exist. */
function includeIssues(library: Library, faction: Faction): Issue[] {
  return faction.includes
    .filter((id) => !library.faction(id))
    .map((id) => ({
      code: 'unknown-include',
      severity: 'error' as const,
      message: `${faction.name} includes "${id}", which is not a faction.`,
      entries: [faction.id],
      source: faction.id,
    }));
}
