import type { Library } from '../library/Library';
import type { Issue } from '../types';
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
    ...library.factions.flatMap((faction) => [
      ...constraintIssues(faction, faction.constraints, faction.id),
      ...faction.units.flatMap((unit) => unitIssues(faction, unit)),
      ...faction.detachments.flatMap((detachment) => detachmentIssues(faction, detachment, library.muster)),
    ]),
  ];
}
