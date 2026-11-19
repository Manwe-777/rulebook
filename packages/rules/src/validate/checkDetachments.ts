import type { Issue } from '../types';
import { keywordKey } from '../utils/keywordKey';
import { issue } from './issue';
import type { Check } from './types';

/** The army has between the allowed number of detachments, each once, and no two share a unique tag. */
export const checkDetachments: Check = (ctx) => {
  const issues: Issue[] = [];
  const { min, max } = ctx.limits.detachments;
  const count = ctx.list.detachments.length;
  const tags = new Map<string, string>();

  if (count < min || count > max) {
    const range = min === max ? `${min}` : `${min} to ${max}`;

    issues.push(issue('detachment-count', `The army has ${count} detachments; it needs ${range}.`));
  }

  if (new Set(ctx.list.detachments).size !== count) {
    issues.push(issue('detachment-twice', 'The same detachment is taken more than once.'));
  }

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
};
