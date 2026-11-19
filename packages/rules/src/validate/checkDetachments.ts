import type { Issue } from '../types';
import { keywordKey } from '../utils/keywordKey';
import { issue } from './issue';
import type { Check, ValidationContext } from './types';

function countIssues(ctx: ValidationContext): Issue[] {
  const { min, max } = ctx.limits.detachments;
  const count = ctx.list.detachments.length;
  const issues: Issue[] = [];

  if (count < min)
    issues.push(issue('detachment-count', `The army needs at least ${min} detachment${min === 1 ? '' : 's'}.`));

  if (max !== undefined && count > max) {
    issues.push(issue('detachment-count', `The army has ${count} detachments; at most ${max} are allowed.`));
  }

  if (new Set(ctx.list.detachments).size !== count) {
    issues.push(issue('detachment-twice', 'The same detachment is taken more than once.'));
  }

  return issues;
}

/** Detachments are paid for in detachment points; a lone detachment may be free of the budget when the rules say so. */
function budgetIssues(ctx: ValidationContext): Issue[] {
  const spent = ctx.detachments.reduce((sum, d) => sum + d.cost, 0);
  const budget = ctx.limits.detachmentPoints;
  const lone = ctx.muster.anyLoneDetachment && ctx.detachments.length === 1;

  if (spent <= budget || lone) return [];

  return [
    issue(
      'detachment-points',
      `The detachments cost ${spent} detachment points; ${ctx.battleSize.name} allows ${budget}.`,
    ),
  ];
}

/** With several detachments the army picks one of their force dispositions; with one, it has that one's. */
function dispositionIssues(ctx: ValidationContext): Issue[] {
  const offered = [...new Set(ctx.detachments.flatMap((d) => (d.disposition ? [d.disposition] : [])))];
  const chosen = ctx.list.disposition;
  const name = (id: string) => ctx.muster.dispositions.find((d) => d.id === id)?.name ?? id;

  if (chosen && !offered.includes(chosen)) {
    return [issue('disposition', `${name(chosen)} is not the disposition of any chosen detachment.`)];
  }

  if (!chosen && offered.length > 1) {
    return [issue('disposition', `Pick the army's force disposition: ${offered.map(name).join(' or ')}.`)];
  }

  return [];
}

function uniqueIssues(ctx: ValidationContext): Issue[] {
  const issues: Issue[] = [];
  const tags = new Map<string, string>();

  for (const detachment of ctx.detachments) {
    for (const tag of detachment.unique) {
      const other = tags.get(keywordKey(tag));

      if (other && other !== detachment.name) {
        issues.push(issue('detachment-unique', `${other} and ${detachment.name} are both ${tag} detachments.`));
      }

      tags.set(keywordKey(tag), detachment.name);
    }
  }

  return issues;
}

/**
 * The army's detachments: enough of them, each once, within the battle size's detachment points, no two sharing a
 * unique tag, and a force disposition from them.
 */
export const checkDetachments: Check = (ctx) => [
  ...countIssues(ctx),
  ...budgetIssues(ctx),
  ...uniqueIssues(ctx),
  ...dispositionIssues(ctx),
];
