import type { Issue, ListEntry, Unit } from '../types';
import { issue } from './issue';
import type { Check } from './types';
import { wargearAllowance } from './wargearAllowance';
import { wargearGroup } from './wargearGroup';

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((id, i) => id === b[i]);

function entryIssues(entry: ListEntry, unit: Unit): Issue[] {
  const issues: Issue[] = [];
  const taken = new Map<string, number>();

  for (const choice of entry.wargear) {
    const option = unit.wargearOptions.find((o) => o.id === choice.option);

    if (!option) {
      issues.push(issue('unknown-wargear', `${unit.name} has no wargear option "${choice.option}".`, [entry.id]));
      continue;
    }

    if (!option.with.some((list) => sameList(list, choice.choice))) {
      issues.push(
        issue('wargear-choice', `${unit.name} can't take ${choice.choice.join(' and ')} that way.`, [entry.id]),
      );
    }

    taken.set(option.id, (taken.get(option.id) ?? 0) + choice.models);
  }

  for (const [id, models] of taken) {
    const allowed = wargearAllowance(
      unit,
      entry,
      unit.wargearOptions.find((o) => o.id === id)!,
    );

    if (models > allowed) {
      issues.push(
        issue('wargear-limit', `${unit.name}: ${models} models take "${id}"; at most ${allowed} can.`, [entry.id]),
      );
    }
  }

  return issues;
}

/** Options of one group taken together by more models than the group allows. */
function groupIssues(entry: ListEntry, unit: Unit): Issue[] {
  const groups = [...new Set(unit.wargearOptions.flatMap((o) => (o.group ? [o.group] : [])))];

  return groups.flatMap((id) => {
    const { options, allowed } = wargearGroup(
      unit,
      entry,
      unit.wargearOptions.find((o) => o.group === id)!,
    );

    const models = entry.wargear
      .filter((w) => options.some((o) => o.id === w.option))
      .reduce((n, w) => n + w.models, 0);

    if (models <= allowed) return [];

    const names = options.map((o) => `"${o.id}"`).join(' or ');

    return [
      issue('wargear-group', `${unit.name}: ${models} models take ${names}; at most ${allowed} can.`, [entry.id]),
    ];
  });
}

/**
 * Each wargear choice exists, picks one of its lists, and is taken by no more models than allowed, alone and with the
 * other options of its group.
 */
export const checkWargear: Check = (ctx) =>
  ctx.entries.flatMap(({ entry, unit }) => [...entryIssues(entry, unit), ...groupIssues(entry, unit)]);
