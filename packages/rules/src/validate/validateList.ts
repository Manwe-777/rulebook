import type { Library } from '../library/Library';
import type { ArmyList, Issue } from '../types';
import { applyAllowances } from './applyAllowances';
import { buildContext } from './buildContext';
import { checkAttachments } from './checkAttachments';
import { checkConstraints } from './checkConstraints';
import { checkDatasheetLimits } from './checkDatasheetLimits';
import { checkDetachments } from './checkDetachments';
import { checkFaction } from './checkFaction';
import { checkFormation } from './checkFormation';
import { checkPoints } from './checkPoints';
import { checkUnitSize } from './checkUnitSize';
import { checkWargear } from './checkWargear';
import { checkWarlord } from './checkWarlord';
import { itemIssues } from './itemIssues';
import type { Check } from './types';

const CHECKS: Check[] = [
  checkFaction,
  checkUnitSize,
  checkWargear,
  checkPoints,
  checkDetachments,
  checkDatasheetLimits,
  (ctx) => itemIssues(ctx, 'enhancement'),
  (ctx) => itemIssues(ctx, 'upgrade'),
  checkWarlord,
  checkAttachments,
  checkConstraints,
  checkFormation,
];

/**
 * Checks whether an army list is legal against a library's faction and muster rules. Returns every problem found;
 * the list is legal when none of them is an error. Never throws.
 */
export function validateList(list: ArmyList, library: Library): Issue[] {
  const { ctx, issues } = buildContext(list, library);

  if (!ctx) return issues;

  const allowances = applyAllowances(ctx);

  return [...issues, ...allowances, ...CHECKS.flatMap((check) => check(ctx))];
}
