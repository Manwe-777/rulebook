import type { Issue } from '../types';
import { activeConstraints } from './activeConstraints';
import { constraintHolds } from './constraintHolds';
import { issue } from './issue';
import type { ValidationContext } from './types';

/**
 * Marks the entries that `allow` constraints exempt from a core check. When an allowance's comparison fails, nothing
 * is exempted and its message is reported.
 */
export function applyAllowances(ctx: ValidationContext): Issue[] {
  const issues: Issue[] = [];

  for (const { constraint, source } of activeConstraints(ctx)) {
    if (!constraint.allow) continue;

    const { ok, selected } = constraintHolds(ctx, constraint);

    if (ok) for (const r of selected) ctx.allowed[constraint.allow].add(r.entry.id);
    else
      issues.push(
        issue(
          constraint.id,
          constraint.message,
          selected.map((r) => r.entry.id),
          source,
        ),
      );
  }

  return issues;
}
