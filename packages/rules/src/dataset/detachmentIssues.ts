import type { Detachment, Faction, Issue, Muster } from '../types';
import { constraintIssues } from './constraintIssues';

function duplicates(ids: string[]): string[] {
  return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
}

/**
 * Problems in one detachment: repeated ids, entries without text, constraints with unknown references, and a force
 * disposition the muster rules don't list (or none, when they list some).
 */
export function detachmentIssues(faction: Faction, detachment: Detachment, muster?: Muster): Issue[] {
  const ref = `${faction.id}/${detachment.id}`;

  const issue = (code: string, severity: Issue['severity'], message: string): Issue => ({
    code,
    severity,
    message,
    entries: [ref],
    source: ref,
  });

  const entries = [...detachment.enhancements, ...detachment.stratagems];
  const dispositions = muster?.dispositions.map((d) => d.id) ?? [];
  const disposition = detachment.disposition;

  const badDisposition =
    dispositions.length > 0 && (!disposition || !dispositions.includes(disposition))
      ? [
          issue(
            'unknown-disposition',
            'warning',
            disposition
              ? `${detachment.name} has the disposition "${disposition}", which the muster rules don't list.`
              : `${detachment.name} has no force disposition.`,
          ),
        ]
      : [];

  return [
    ...duplicates(detachment.enhancements.map((e) => e.id)).map((id) =>
      issue('id-twice', 'error', `${detachment.name} has two enhancements "${id}".`),
    ),
    ...duplicates(detachment.stratagems.map((s) => s.id)).map((id) =>
      issue('id-twice', 'error', `${detachment.name} has two stratagems "${id}".`),
    ),
    ...entries
      .filter((e) => !e.text)
      .map((e) => issue('missing-text', 'warning', `${e.name} in ${detachment.name} has no rules text.`)),
    ...constraintIssues(faction, detachment.constraints, ref),
    ...badDisposition,
  ];
}
