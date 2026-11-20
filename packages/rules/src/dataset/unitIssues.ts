import type { Constraint, Faction, Issue, Unit } from '../types';
import { keywordKey } from '../utils/keywordKey';
import { constraintIssues } from './constraintIssues';

const error = (code: string, message: string, ref: string): Issue => ({
  code,
  severity: 'error',
  message,
  entries: [ref],
  source: ref,
});

const warning = (code: string, message: string, ref: string): Issue => ({
  ...error(code, message, ref),
  severity: 'warning',
});

function weaponIssues(unit: Unit, ref: string): Issue[] {
  const weapons = new Set([...unit.ranged, ...unit.melee, ...unit.equipment].map((w) => w.id));

  const used = [
    ...Object.values(unit.composition.wargear).flat(),
    ...unit.wargearOptions.flatMap((o) => [...o.replace, ...o.with.flat()]),
  ];

  return [...new Set(used)]
    .filter((id) => !weapons.has(id))
    .map((id) => error('unknown-weapon', `${unit.name} refers to a weapon "${id}" that is not on its datasheet.`, ref));
}

function compositionIssues(unit: Unit, ref: string): Issue[] {
  const { models, points, wargear } = unit.composition;
  const names = new Set(models.map((m) => m.name));
  const least = models.reduce((sum, m) => sum + m.min, 0);
  const most = models.reduce((sum, m) => sum + m.max, 0);
  const sizes = points.map((p) => p.models);
  const issues: Issue[] = [];

  for (const type of [...Object.keys(wargear), ...unit.wargearOptions.flatMap((o) => (o.models ? [o.models] : []))]) {
    if (!names.has(type)) issues.push(error('unknown-model', `${unit.name} has no model type "${type}".`, ref));
  }

  for (const size of sizes) {
    if (size < least || size > most) {
      issues.push(
        error(
          'size-out-of-range',
          `${unit.name} costs a ${size} model unit, but it can only have ${least} to ${most} models.`,
          ref,
        ),
      );
    }
  }

  if (new Set(sizes).size !== sizes.length)
    issues.push(error('size-twice', `${unit.name} lists a unit size twice.`, ref));

  return issues;
}

function attachIssues(faction: Faction, unit: Unit, ref: string): Issue[] {
  const ids = new Set(faction.units.map((u) => u.id));
  const issues: Issue[] = [];

  for (const kind of ['leader', 'support'] as const) {
    const ability = kind === 'leader' ? 'Leader' : 'Support';
    const hasAbility = unit.coreAbilities.some((a) => keywordKey(a) === keywordKey(ability));

    for (const id of unit[kind]?.bodyguards ?? []) {
      if (!ids.has(id))
        issues.push(
          error('unknown-bodyguard', `${unit.name} can join "${id}", which is not a unit of this faction.`, ref),
        );
    }

    if (hasAbility !== Boolean(unit[kind])) {
      issues.push(
        warning(
          `${kind}-mismatch`,
          `${unit.name} needs both the ${ability} core ability and a ${kind} list, or neither.`,
          ref,
        ),
      );
    }
  }

  return issues;
}

/** Problems in one unit's data: unknown weapons and model types, impossible sizes, and attachment mistakes. */
/** A leader or support condition, checked for unknown references like a constraint named after its role. */
function attachConditions(unit: Unit): Constraint[] {
  return (['leader', 'support'] as const).flatMap((role) => {
    const block = unit[role];

    return [block?.when?.has, block?.unless?.has].flatMap((has) =>
      has ? [{ id: role, select: has, measure: 'count' as const, min: 1, message: role }] : [],
    );
  });
}

export function unitIssues(faction: Faction, unit: Unit): Issue[] {
  const ref = `${faction.id}/${unit.id}`;
  const keyword = unit.factionKeywords.some((k) => keywordKey(k) === keywordKey(faction.factionKeyword));

  return [
    ...weaponIssues(unit, ref),
    ...compositionIssues(unit, ref),
    ...attachIssues(faction, unit, ref),
    ...constraintIssues(faction, [...unit.constraints, ...attachConditions(unit)], ref),
    ...(keyword
      ? []
      : [warning('missing-faction-keyword', `${unit.name} doesn't have the ${faction.factionKeyword} keyword.`, ref)]),
  ];
}
