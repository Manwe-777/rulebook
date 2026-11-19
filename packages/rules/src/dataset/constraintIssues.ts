import type { Constraint, Faction, Issue } from '../types';

/** References in a constraint to units, enhancements or detachments the faction doesn't have. */
export function constraintIssues(faction: Faction, constraints: Constraint[], source: string): Issue[] {
  const units = new Set(faction.units.map((u) => u.id));
  const items = new Set(faction.detachments.flatMap((d) => d.enhancements.map((e) => e.id)));
  const detachments = new Set(faction.detachments.map((d) => d.id));

  return constraints.flatMap((c) => {
    const selectors = [c.select, c.when?.has].filter((s) => s !== undefined);
    const unitIds = selectors.flatMap((s) => [...(s.units?.ids ?? []), ...(s.attached?.ids ?? [])]);
    const itemIds = selectors.flatMap((s) => [...(s.enhancements?.ids ?? []), ...(s.upgrades?.ids ?? [])]);

    const unknown = [
      ...unitIds.filter((id) => !units.has(id)).map((id) => `unit "${id}"`),
      ...itemIds.filter((id) => !items.has(id)).map((id) => `enhancement "${id}"`),
      ...(c.when?.detachment && !detachments.has(c.when.detachment) ? [`detachment "${c.when.detachment}"`] : []),
    ];

    return unknown.map((what) => ({
      code: 'unknown-reference',
      severity: 'error' as const,
      message: `Constraint "${c.id}" refers to ${what}, which this faction doesn't have.`,
      entries: [source],
      source,
    }));
  });
}
