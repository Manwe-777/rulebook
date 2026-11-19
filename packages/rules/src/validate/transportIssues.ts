import type { Issue } from '../types';
import { hasKeywords } from './hasKeywords';
import { issue } from './issue';
import type { Resolved, ValidationContext } from './types';

/** Places one embarked entry takes: its models, times the largest space rule matching its keywords. */
function spaceOf(transport: NonNullable<Resolved['unit']['transport']>, passenger: Resolved): number {
  const sizes = Object.entries(transport.space).filter(([k]) => hasKeywords(passenger.unit, [k]));

  return passenger.entry.models * Math.max(1, ...sizes.map(([, n]) => n));
}

/** Units embarked in one transport are allowed in it and fit its capacity. */
export function transportIssues(ctx: ValidationContext, transportId: string, passengerIds: string[]): Issue[] {
  const carrier = ctx.byId.get(transportId);
  const transport = carrier?.unit.transport;

  if (!carrier || !transport)
    return [issue('not-a-transport', `"${transportId}" is not a transport in the list.`, [transportId])];

  const issues: Issue[] = [];
  let used = 0;

  for (const id of passengerIds) {
    const passenger = ctx.byId.get(id);

    if (!passenger) issues.push(issue('unknown-passenger', `"${id}" is not in the list.`, [id]));
    else if (
      !hasKeywords(passenger.unit, transport.allows) ||
      (transport.excludes.length && hasKeywords(passenger.unit, transport.excludes, true))
    ) {
      issues.push(
        issue('cannot-embark', `${passenger.unit.name} can't embark in ${carrier.unit.name}.`, [id, transportId]),
      );
    } else used += spaceOf(transport, passenger);
  }

  if (used > transport.capacity) {
    issues.push(
      issue('transport-full', `${carrier.unit.name} carries ${used} models' worth; it fits ${transport.capacity}.`, [
        transportId,
      ]),
    );
  }

  return issues;
}
