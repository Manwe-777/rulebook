import type { Issue } from '../types';
import { issue } from './issue';
import type { Check, Resolved, ValidationContext } from './types';

/** Whether the entry joins its bodyguard as a leader or a support unit, or why it can't join. */
function joinAs(ctx: ValidationContext, { entry, unit }: Resolved): 'leader' | 'support' | Issue {
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

  const id = bodyguard.unit.id;

  if (unit.leader?.bodyguards.includes(id)) return 'leader';
  if (unit.support?.bodyguards.includes(id)) return 'support';

  return issue('cannot-attach', `${unit.name} can't be attached to ${bodyguard.unit.name}.`, [
    entry.id,
    bodyguard.entry.id,
  ]);
}

/** Leader and support units join only bodyguards on their datasheet, within the per-bodyguard limits. */
export const checkAttachments: Check = (ctx) => {
  const issues: Issue[] = [];
  const joined = new Map<string, { leader: string[]; support: string[] }>();

  for (const r of ctx.entries.filter((e) => e.entry.attachedTo)) {
    const as = joinAs(ctx, r);

    if (typeof as !== 'string') issues.push(as);
    else {
      const slot = joined.get(r.entry.attachedTo!) ?? { leader: [], support: [] };

      slot[as].push(r.entry.id);
      joined.set(r.entry.attachedTo!, slot);
    }
  }

  const { leadersPerBodyguard, supportPerBodyguard } = ctx.muster.attachments;

  for (const [bodyguard, { leader, support }] of joined) {
    const name = ctx.byId.get(bodyguard)!.unit.name;
    const exempt = [...leader, ...support].every((id) => ctx.allowed.attachments.has(id));

    if (!exempt && leader.length > leadersPerBodyguard) {
      issues.push(
        issue('too-many-leaders', `${name} has ${leader.length} leaders; at most ${leadersPerBodyguard} can join.`, [
          bodyguard,
          ...leader,
        ]),
      );
    }

    if (!exempt && support.length > supportPerBodyguard) {
      issues.push(
        issue(
          'too-many-support',
          `${name} has ${support.length} support units; at most ${supportPerBodyguard} can join.`,
          [bodyguard, ...support],
        ),
      );
    }
  }

  return issues;
};
