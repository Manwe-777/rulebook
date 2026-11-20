import type { Issue, Unit } from '../types';
import { conditionHolds } from './conditionHolds';
import { issue } from './issue';
import type { Check, Resolved, ValidationContext } from './types';

type Role = 'leader' | 'support';

interface Slots {
  leader: string[];
  support: string[];
}

/** Whether a datasheet's leader or support block lists this bodyguard, its `when` holds and its `unless` doesn't. */
function canJoin(ctx: ValidationContext, unit: Unit, role: Role, bodyguard: string): boolean {
  const block = unit[role];

  if (!block?.bodyguards.includes(bodyguard)) return false;

  return (!block.when || conditionHolds(ctx, block.when)) && !(block.unless && conditionHolds(ctx, block.unless));
}

/** The roles the entry could join its bodyguard in, or why it can't join at all. */
function joinRoles(ctx: ValidationContext, { entry, unit }: Resolved): Role[] | Issue {
  const bodyguard = ctx.byId.get(entry.attachedTo!);

  if (!bodyguard)
    return issue('unknown-bodyguard', `${unit.name} is attached to "${entry.attachedTo}", which is not in the list.`, [
      entry.id,
    ]);

  if (bodyguard.entry.attachedTo) {
    return issue('attached-to-attached', `${unit.name} can't join ${bodyguard.unit.name}, which is itself attached.`, [
      entry.id,
    ]);
  }

  const roles = (['leader', 'support'] as const).filter((role) => canJoin(ctx, unit, role, bodyguard.unit.id));

  if (roles.length > 0) return roles;

  return issue('cannot-attach', `${unit.name} can't be attached to ${bodyguard.unit.name}.`, [
    entry.id,
    bodyguard.entry.id,
  ]);
}

/**
 * Puts each attached entry in its bodyguard's leader or support slots. Entries with one possible role go first; an
 * entry that could be either leads while the bodyguard has room for a leader, and supports otherwise.
 */
function fillSlots(ctx: ValidationContext, issues: Issue[]): Map<string, Slots> {
  const joined = new Map<string, Slots>();
  const flexible: Resolved[] = [];
  const slots = (id: string) => joined.get(id) ?? joined.set(id, { leader: [], support: [] }).get(id)!;

  for (const r of ctx.entries.filter((e) => e.entry.attachedTo)) {
    const roles = joinRoles(ctx, r);

    if (!Array.isArray(roles)) issues.push(roles);
    else if (roles.length === 1) slots(r.entry.attachedTo!)[roles[0]].push(r.entry.id);
    else flexible.push(r);
  }

  for (const r of flexible) {
    const slot = slots(r.entry.attachedTo!);

    const leaders = slot.leader.filter((id) => !ctx.allowed.attachments.has(id)).length;

    slot[leaders < limits(ctx, r.entry.attachedTo!).leader ? 'leader' : 'support'].push(r.entry.id);
  }

  return joined;
}

/**
 * How many leader and support units a bodyguard takes: the muster limits, one more leader when an `allow: attachments`
 * constraint selects the bodyguard itself.
 */
function limits(ctx: ValidationContext, bodyguard: string): Record<Role, number> {
  const { leadersPerBodyguard, supportPerBodyguard } = ctx.muster.attachments;

  return {
    leader: leadersPerBodyguard + (ctx.allowed.attachments.has(bodyguard) ? 1 : 0),
    support: supportPerBodyguard,
  };
}

/**
 * Leader and support units join only bodyguards on their datasheet, within the per-bodyguard limits. Units an
 * `allow: attachments` constraint selects ("can join a unit that already has a Leader") don't count toward them.
 */
export const checkAttachments: Check = (ctx) => {
  const issues: Issue[] = [];
  const joined = fillSlots(ctx, issues);

  for (const [bodyguard, slots] of joined) {
    const name = ctx.byId.get(bodyguard)!.unit.name;
    const max = limits(ctx, bodyguard);

    for (const role of ['leader', 'support'] as const) {
      const counted = slots[role].filter((id) => !ctx.allowed.attachments.has(id));

      if (counted.length <= max[role]) continue;

      const [code, what] = role === 'leader' ? ['too-many-leaders', 'leaders'] : ['too-many-support', 'support units'];

      issues.push(
        issue(code, `${name} has ${counted.length} ${what}; at most ${max[role]} can join.`, [
          bodyguard,
          ...slots[role],
        ]),
      );
    }
  }

  return issues;
};
