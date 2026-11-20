import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { constraintSchema } from '../schemas/constraintSchema';
import { demoLibrary, demoList, withMuster } from '../testing/demoList';
import type { ArmyList, ListEntry } from '../types';
import { detachmentPoints } from './detachmentPoints';
import { listPoints } from './listPoints';
import { validateList } from './validateList';
import { wargearAllowance } from './wargearAllowance';

const base = demoList();

/** Error codes for a list, sorted, so each test can say exactly which rule broke. */
function codes(list: ArmyList, library = demoLibrary): string[] {
  return validateList(list, library)
    .filter((i) => i.severity === 'error')
    .map((i) => i.code)
    .sort();
}

const withUnits = (...extra: Partial<ListEntry>[]) =>
  demoList({ units: [...base.units, ...extra.map((e, i) => ({ id: `extra${i}`, models: 1, ...e }) as ListEntry)] });

const replaceUnit = (id: string, change: Partial<ListEntry>) =>
  demoList({ units: base.units.map((u) => (u.id === id ? { ...u, ...change } : u)) });

describe('validateList: the baseline', () => {
  it('the demo list is legal', () => {
    expect(validateList(base, demoLibrary)).toEqual([]);
  });

  it('issues name the entries they are about and where the rule came from', () => {
    const [issue] = validateList(replaceUnit('troopers', { models: 12 }), demoLibrary);

    expect(issue).toMatchObject({ code: 'unit-size', severity: 'error', entries: ['troopers'], source: 'core' });
    expect(issue.message).toBe('Line Troopers has 12 models; it can have 10 or 20.');
  });
});

describe('validateList: references', () => {
  it('an unknown faction, battle size or missing muster rules stop the check with one clear issue', () => {
    expect(codes(demoList({ faction: 'nobody' }))).toEqual(['unknown-faction']);
    expect(codes(demoList({ battleSize: 'apocalypse' }))).toEqual(['unknown-battle-size']);
    expect(codes(base, Object.assign(Object.create(demoLibrary), { muster: undefined }))).toEqual(['no-muster-rules']);
  });

  it('an unknown unit is reported and left out of the other checks', () => {
    expect(codes(withUnits({ unit: 'dragon' }))).toEqual(['unknown-unit']);
  });

  it('two entries with the same id are reported', () => {
    expect(codes(withUnits({ id: 'vets', unit: 'veteran-squad', models: 5 }))).toContain('duplicate-entry');
  });

  it('an unknown detachment is reported', () => {
    expect(codes(demoList({ detachments: ['shield-wall', 'nope'] }))).toEqual(['unknown-detachment']);
  });
});

describe('validateList: unit size and wargear', () => {
  it('a unit must have one of its listed sizes', () => {
    expect(codes(replaceUnit('troopers', { models: 20 }))).toEqual([]);
    expect(codes(replaceUnit('troopers', { models: 15 }))).toEqual(['unit-size']);
  });

  it('a numbered option allows up to that many models, and not one more', () => {
    const melta = (models: number) => [{ option: 'melta', models, choice: ['melta-gun'] }];

    expect(codes(replaceUnit('vets', { wargear: melta(2) }))).toEqual([]);
    expect(codes(replaceUnit('vets', { wargear: melta(3) }))).toEqual(['wargear-limit']);
  });

  it('a "one in every N" option scales with the unit size', () => {
    const flamers = (models: number) => [{ option: 'flamer', models, choice: ['flamer'] }];

    expect(codes(replaceUnit('troopers', { wargear: flamers(1) }))).toEqual([]);
    expect(codes(replaceUnit('troopers', { wargear: flamers(2) }))).toEqual(['wargear-limit']);
    expect(codes(replaceUnit('troopers', { models: 20, wargear: flamers(2) }))).toEqual([]);
  });

  it('"up to 2 in every 5" allows twice as many as "1 in every 5"', () => {
    const troopers = demoLibrary.unit('demo-host', 'line-troopers')!.unit;
    const option = { ...troopers.wargearOptions[0], per: { every: 5, count: 2 } };

    expect(wargearAllowance(troopers, { models: 10 }, option)).toBe(4);
    expect(wargearAllowance(troopers, { models: 20 }, option)).toBe(8);
  });

  it('the same option taken in two rows counts all of its models', () => {
    const row = { option: 'melta', models: 2, choice: ['melta-gun'] };

    expect(codes(replaceUnit('vets', { wargear: [row, row] }))).toEqual(['wargear-limit']);
  });

  it('an unknown option or a choice that is not one of its lists is reported', () => {
    expect(codes(replaceUnit('vets', { wargear: [{ option: 'lasers', models: 1, choice: ['x'] }] }))).toEqual([
      'unknown-wargear',
    ]);

    expect(codes(replaceUnit('vets', { wargear: [{ option: 'melta', models: 1, choice: ['carbine'] }] }))).toEqual([
      'wargear-choice',
    ]);
  });
});

describe('validateList: points', () => {
  const at = (points: number) =>
    withMuster({ battleSizes: [{ id: 'strike-force', name: 'Test', points, overrides: {} }] });

  it('counts unit sizes, paid wargear, enhancements and detachments, up to exactly the limit', () => {
    // 70 + 15 (captain and enhancement) + 65 + 90 + 2 × 5 (melta) + 45 = 295
    expect(codes(base, at(295))).toEqual([]);
    expect(codes(base, at(294))).toEqual(['points-over-limit']);
  });

  it('detachments cost detachment points, not points', () => {
    const list = demoList({
      detachments: ['rapid-response'],
      units: base.units.map((u) => ({ ...u, enhancement: undefined })),
    });

    // 280 for the units without the enhancement; the detachment adds nothing
    expect(codes(list, at(280))).toEqual([]);
    expect(codes(list, at(279))).toEqual(['points-over-limit']);
  });
});

describe('validateList: detachments', () => {
  const two = { detachments: ['shield-wall', 'armoured-column'], disposition: 'take-and-hold' };

  it('an army needs a detachment, and can take several while their detachment points fit the battle size', () => {
    // Shield Wall (2) + Armoured Column (1) = 3, the Strike Force budget
    expect(codes(demoList(two))).toEqual([]);
    expect(codes(demoList({ detachments: [] }))).toContain('detachment-count');
  });

  it('detachments costing more than the battle size allows are reported', () => {
    expect(codes(demoList({ ...two, battleSize: 'incursion' }))).toEqual(['detachment-points']);

    const message = validateList(demoList({ ...two, battleSize: 'incursion' }), demoLibrary)[0].message;

    expect(message).toBe('The detachments cost 3 detachment points; Incursion allows 2.');
  });

  it('when the muster rules allow it, a lone detachment may be taken whatever its cost', () => {
    const tight = (anyLoneDetachment: boolean) => withMuster({ detachmentPoints: 1, anyLoneDetachment });

    expect(codes(base, tight(false))).toEqual(['detachment-points']);
    expect(codes(base, tight(true))).toEqual([]);
    expect(codes(demoList(two), tight(true))).toEqual(['detachment-points']);
  });

  it("two detachments that share a unique tag can't be taken together", () => {
    const list = demoList({ detachments: ['shield-wall', 'rapid-response'], disposition: 'take-and-hold' });

    expect(codes(list, withMuster({ detachmentPoints: 4 }))).toEqual(['detachment-unique']);
  });

  it('tells the builder how many detachment points are spent and allowed', () => {
    expect(detachmentPoints(demoList(two), demoLibrary)).toEqual({ spent: 3, budget: 3 });

    expect(detachmentPoints(demoList({ ...two, battleSize: 'incursion' }), demoLibrary)).toEqual({
      spent: 3,
      budget: 2,
    });
  });

  it('the same detachment twice is reported', () => {
    expect(codes(demoList({ detachments: ['shield-wall', 'shield-wall'] }))).toContain('detachment-twice');
  });

  it('an army picks one of the dispositions its detachments offer; a single one offered is its own', () => {
    expect(codes(demoList({ ...two, disposition: undefined }))).toEqual(['disposition']);
    expect(codes(demoList({ ...two, disposition: 'disruption' }))).toEqual([]);
    expect(codes(demoList({ ...two, disposition: 'reconnaissance' }))).toEqual(['disposition']);
    expect(codes(base)).toEqual([]);
  });

  it('a lone detachment that offers two dispositions still needs one picked', () => {
    // Without the Shield Wall enhancement the base list carries
    const column = {
      detachments: ['armoured-column'],
      units: base.units.map((u) => ({ ...u, enhancement: undefined })),
    };

    expect(codes(demoList(column))).toEqual(['disposition']);
    expect(codes(demoList({ ...column, disposition: 'purge-the-foe' }))).toEqual([]);
  });
});

describe('validateList: datasheet limits', () => {
  const vets = (n: number) => Array.from({ length: n }, () => ({ unit: 'veteran-squad', models: 5 }));

  it('a unit with no special role can be taken up to the default limit', () => {
    expect(codes(withUnits(...vets(2)))).toEqual([]);
    expect(codes(withUnits(...vets(3)))).toEqual(['datasheet-limit']);
  });

  it('battleline units use their own, higher limit', () => {
    const troopers = Array.from({ length: 5 }, () => ({ unit: 'line-troopers', models: 10 }));

    expect(codes(withUnits(...troopers))).toEqual([]);
    expect(codes(withUnits(...troopers, { unit: 'line-troopers', models: 10 }))).toEqual(['datasheet-limit']);
  });

  it('a detachment can make a unit battleline, and its limit with it', () => {
    const army = (n: number, detachments: string[]) =>
      demoList({
        detachments,
        disposition: detachments.includes('armoured-column') ? 'disruption' : undefined,
        units: [{ id: 'captain', unit: 'field-captain', models: 1 }, ...vets(n).map((v, i) => ({ ...v, id: `v${i}` }))],
      });

    expect(codes(army(6, ['armoured-column']))).toEqual([]);
    expect(codes(army(7, ['armoured-column']))).toEqual(['datasheet-limit']);
    expect(codes(army(4, ['shield-wall']))).toEqual(['datasheet-limit']);
  });

  it('an epic hero can be taken once', () => {
    expect(codes(withUnits({ unit: 'marshal-venn' }))).toEqual([]);
    expect(codes(withUnits({ unit: 'marshal-venn' }, { unit: 'marshal-venn' }))).toEqual(['datasheet-limit']);
  });
});

describe('validateList: enhancements and upgrades', () => {
  it('an enhancement must come from a chosen detachment', () => {
    expect(codes(replaceUnit('captain', { enhancement: 'forward-observer' }))).toEqual(['unknown-enhancement']);
  });

  it('an enhancement goes only on a model with its keywords, and never on an epic hero', () => {
    expect(codes(replaceUnit('bearer', { enhancement: 'old-campaigner' }))).toEqual([]);
    expect(codes(replaceUnit('troopers', { enhancement: 'old-campaigner' }))).toEqual(['enhancement-bearer']);
    expect(codes(withUnits({ unit: 'marshal-venn', enhancement: 'old-campaigner' }))).toEqual(['enhancement-bearer']);
  });

  it('an enhancement for one of several kinds of model names them all when the bearer is none of them', () => {
    const list = withUnits({ unit: 'marshal-venn', enhancement: 'old-campaigner' });
    const issue = validateList(list, demoLibrary).find((i) => i.code === 'enhancement-bearer');

    expect(issue?.message).toBe("Marshal Venn can't take Old Campaigner: it needs FIELD CAPTAIN or STANDARD BEARER.");
  });

  it('each enhancement is taken once', () => {
    expect(codes(replaceUnit('bearer', { enhancement: 'banner-of-resolve' }))).toEqual(
      expect.arrayContaining(['enhancement-twice']),
    );
  });

  it('the army can take up to the enhancement limit, and not one more', () => {
    const library = withMuster({ enhancements: { ...demoLibrary.muster!.enhancements, max: 1 } });

    expect(codes(base, library)).toEqual([]);
    expect(codes(replaceUnit('bearer', { enhancement: 'old-campaigner' }), library)).toEqual(['enhancement-limit']);
  });

  it('taking any upgrades uses up an enhancement slot', () => {
    const library = withMuster({
      enhancements: { ...demoLibrary.muster!.enhancements, max: 1 },
    });

    const withUpgrade = demoList({
      units: [
        ...base.units,
        { id: 'carrier', unit: 'armoured-carrier', models: 1, wargear: [], upgrade: 'reinforced-plating' },
      ],
    });

    expect(codes(base, library)).toEqual([]);
    expect(codes(withUpgrade, library)).toEqual(['enhancement-limit']);
  });

  it('the same upgrade can go on several units, unless the muster rules allow each only once', () => {
    const carriers = demoList({
      detachments: ['shield-wall'],
      units: [1, 2].map((n) => ({ id: `c${n}`, unit: 'armoured-carrier', models: 1, upgrade: 'reinforced-plating' })),
    });

    const once = withMuster({ upgrades: { ...demoLibrary.muster!.upgrades, once: true } });

    expect(codes(carriers)).not.toContain('upgrade-twice');
    expect(codes(carriers, once)).toContain('upgrade-twice');
  });

  it('an upgrade goes on a unit with its keywords, and is not an enhancement', () => {
    expect(codes(withUnits({ unit: 'armoured-carrier', upgrade: 'reinforced-plating' }))).toEqual([]);
    expect(codes(replaceUnit('vets', { upgrade: 'reinforced-plating' }))).toEqual(['upgrade-bearer']);

    expect(codes(withUnits({ unit: 'armoured-carrier', enhancement: 'reinforced-plating' }))).toEqual([
      'enhancement-kind',
    ]);
  });
});

describe('validateList: warlord', () => {
  it('the army needs a warlord, who is a character in the list', () => {
    expect(codes(demoList({ warlord: undefined }))).toEqual(['no-warlord']);
    expect(codes(demoList({ warlord: 'troopers' }))).toEqual(['warlord-role']);
    expect(codes(demoList({ warlord: 'ghost' }))).toEqual(['unknown-warlord']);
  });
});

describe('validateList: attachments', () => {
  it('a leader joins only bodyguards on its datasheet', () => {
    expect(codes(replaceUnit('captain', { attachedTo: 'vets' }))).toEqual([]);
    expect(codes(withUnits({ unit: 'marshal-venn', attachedTo: 'troopers' }))).toEqual(['cannot-attach']);
  });

  it('a bodyguard takes one leader and one support unit, and no second leader', () => {
    expect(codes(withUnits({ unit: 'marshal-venn', attachedTo: 'vets' }))).toEqual([]);
    expect(codes(withUnits({ unit: 'field-captain', attachedTo: 'troopers' }))).toEqual(['too-many-leaders']);
    expect(codes(withUnits({ unit: 'standard-bearer', attachedTo: 'troopers' }))).toEqual(['too-many-support']);
  });

  it("a unit can't join a unit that is missing or is itself attached", () => {
    expect(codes(replaceUnit('captain', { attachedTo: 'ghost' }))).toEqual(['unknown-bodyguard']);
    expect(codes(withUnits({ unit: 'field-captain', attachedTo: 'bearer' }))).toEqual(['attached-to-attached']);
  });
});

describe('validateList: constraints', () => {
  const library = (constraint: Partial<z.input<typeof constraintSchema>>) =>
    withMuster({
      constraints: [
        constraintSchema.parse({ id: 'c', select: {}, measure: 'count', message: 'Broken.', ...constraint }),
      ],
    });

  it('a detachment constraint applies only when that detachment is chosen', () => {
    const rapid = demoList({
      detachments: ['rapid-response'],
      units: base.units.map((u) => ({ ...u, enhancement: undefined })),
    });

    expect(codes(rapid)).toEqual([]);
    expect(codes({ ...rapid, units: rapid.units.filter((u) => u.id !== 'vets') })).toEqual(['needs-deep-strikers']);
  });

  it('count, models and points measures compare with min, max and equal', () => {
    expect(codes(base, library({ select: { units: { roles: ['character'] } }, max: 2 }))).toEqual([]);
    expect(codes(base, library({ select: { units: { roles: ['character'] } }, max: 1 }))).toEqual(['c']);

    expect(
      codes(base, library({ select: { units: { keywords: ['INFANTRY'] } }, measure: 'models', equal: 17 })),
    ).toEqual([]);

    expect(
      codes(base, library({ select: { units: { ids: ['veteran-squad'] } }, measure: 'points', min: 101 })),
    ).toEqual(['c']);
  });

  it('maxShare compares with a share of the points limit', () => {
    // Veterans cost 100 of a 2000 point limit: 5%.
    const vets = { select: { units: { ids: ['veteran-squad'] } }, measure: 'points' as const };

    expect(codes(base, library({ ...vets, maxShare: 0.05 }))).toEqual([]);
    expect(codes(base, library({ ...vets, maxShare: 0.04 }))).toEqual(['c']);
  });

  it('selectors can match any keyword, invert a filter, and pick by enhancement or attached leader', () => {
    expect(codes(base, library({ select: { units: { anyKeywords: ['VEHICLE', 'BATTLELINE'] } }, equal: 1 }))).toEqual(
      [],
    );

    expect(codes(base, library({ select: { units: { roles: ['character'], not: true } }, equal: 2 }))).toEqual([]);
    expect(codes(base, library({ select: { enhancements: { ids: ['banner-of-resolve'] } }, equal: 1 }))).toEqual([]);
    expect(codes(base, library({ select: { attached: { ids: ['field-captain'] } }, equal: 1 }))).toEqual([]);
  });

  it('a constraint with a when only applies when every condition holds', () => {
    const when = { battleSize: 'incursion' };

    expect(codes(base, library({ when, select: {}, max: 0 }))).toEqual([]);
    expect(codes(base, library({ when: { has: { units: { ids: ['veteran-squad'] } } }, max: 0 }))).toEqual(['c']);
  });

  it("unless switches a constraint off while its condition holds, and faction tests the army's faction", () => {
    expect(codes(base, library({ max: 0, unless: { detachment: 'shield-wall' } }))).toEqual([]);
    expect(codes(base, library({ max: 0, unless: { faction: 'other-host' } }))).toEqual(['c']);
    expect(codes(base, library({ max: 0, when: { faction: 'demo-host' } }))).toEqual(['c']);
    expect(codes(base, library({ max: 0, when: { faction: 'other-host' } }))).toEqual([]);
  });

  it('an allow constraint lifts a core check for the units it selects, within its limit', () => {
    const allowVets = (max: number) =>
      library({ allow: 'datasheet-limit', select: { units: { ids: ['veteran-squad'] } }, max });

    const vets = Array.from({ length: 3 }, () => ({ unit: 'veteran-squad', models: 5 }));

    expect(codes(withUnits(...vets), allowVets(4))).toEqual([]);
    expect(codes(withUnits(...vets), allowVets(3))).toEqual(['c', 'datasheet-limit']);
  });

  it('an allow constraint can let units of another faction in', () => {
    const allow = library({ allow: 'faction', select: { units: { ids: ['line-troopers'] } }, max: 2 });

    const foreign = Object.assign(Object.create(demoLibrary), {
      muster: allow.muster,
      faction: (id: string) =>
        id === 'demo-host' ? { ...demoLibrary.faction(id)!, factionKeyword: 'OTHER' } : undefined,
    });

    expect(codes(base, foreign)).toEqual(expect.arrayContaining(['wrong-faction']));

    expect(
      validateList(base, foreign)
        .filter((i) => i.code === 'wrong-faction')
        .flatMap((i) => i.entries),
    ).not.toContain('troopers');
  });
});

describe('validateList: battle formation', () => {
  const carrier = { id: 'carrier', unit: 'armoured-carrier', models: 1 };
  const units = [...base.units, carrier];

  it('units embarked in a transport must fit its capacity, counting characters as two', () => {
    // 10 troopers + captain (2) = 12 places
    expect(codes(demoList({ units, formation: { embarked: { carrier: ['troopers', 'captain'] } } }))).toEqual([]);

    expect(codes(demoList({ units, formation: { embarked: { carrier: ['troopers', 'captain', 'bearer'] } } }))).toEqual(
      ['transport-full'],
    );
  });

  it('only allowed units embark, each in one transport, and only in transports', () => {
    const other = { id: 'carrier2', unit: 'armoured-carrier', models: 1 };

    expect(codes(demoList({ units: [...units, other], formation: { embarked: { carrier: ['carrier2'] } } }))).toEqual([
      'cannot-embark',
    ]);

    expect(
      codes(demoList({ units: [...units, other], formation: { embarked: { carrier: ['vets'], carrier2: ['vets'] } } })),
    ).toEqual(['embarked-twice']);

    expect(codes(demoList({ units, formation: { embarked: { vets: ['bearer'] } } }))).toEqual(['not-a-transport']);
  });

  it('strategic reserves hold up to their share of the points limit, counting units embarked in them', () => {
    const at = (points: number) =>
      withMuster({ battleSizes: [{ id: 'strike-force', name: 'Test', points, overrides: {} }] });

    // carrier 80 + troopers 65 = 145 in reserve; half of 290 is 145.
    const list = demoList({ units, formation: { reserves: ['carrier'], embarked: { carrier: ['troopers'] } } });

    expect(codes(list, at(290)).filter((c) => c !== 'points-over-limit')).toEqual([]);
    expect(codes(list, at(288)).filter((c) => c !== 'points-over-limit')).toEqual(['reserves-limit']);
  });
});

describe('listPoints', () => {
  it('gives the total, the limit and the cost of each entry', () => {
    expect(listPoints(base, demoLibrary)).toEqual({
      total: 295,
      limit: 2000,
      entries: { captain: 85, troopers: 65, vets: 100, bearer: 45 },
    });
  });

  it('later copies of a datasheet with a surcharge cost more, counted in list order', () => {
    const carriers = demoList({
      units: [1, 2, 3, 4].map((n) => ({ id: `carrier${n}`, unit: 'armoured-carrier', models: 1 }) as ListEntry),
    });

    expect(listPoints(carriers, demoLibrary).entries).toEqual({
      carrier1: 80,
      carrier2: 80,
      carrier3: 90,
      carrier4: 90,
    });
  });

  it('wargear that costs extra adds its points for each one carried', () => {
    const flamers = (models: number) =>
      listPoints(
        demoList({
          units: [
            {
              id: 't',
              unit: 'line-troopers',
              models: 20,
              wargear: models ? [{ option: 'flamer', models, choice: ['flamer'] }] : [],
            },
          ],
        }),
        demoLibrary,
      ).entries.t;

    expect([flamers(0), flamers(1), flamers(2)]).toEqual([130, 135, 140]);
  });

  it('a list that cannot be checked costs nothing and has no limit', () => {
    expect(listPoints(demoList({ faction: 'nobody' }), demoLibrary)).toEqual({ total: 0, limit: null, entries: {} });
  });
});
