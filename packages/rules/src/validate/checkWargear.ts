import type { Issue, ListEntry, Unit } from '../types';
import { issue } from './issue';
import type { Check } from './types';
import { wargearAllowance } from './wargearAllowance';

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

/** Each wargear choice exists, picks one of its lists, and is taken by no more models than allowed. */
export const checkWargear: Check = (ctx) => ctx.entries.flatMap(({ entry, unit }) => entryIssues(entry, unit));
