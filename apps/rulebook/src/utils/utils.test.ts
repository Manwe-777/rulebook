import type { Enhancement, MeleeWeapon, Unit } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { bundledLibrary } from '../library/bundledLibrary';
import { compositionLines } from './compositionLines';
import { eligibilityText } from './eligibilityText';
import { equipmentLines } from './equipmentLines';
import { factionTheme } from './factionTheme';
import { markProfileGroups } from './markProfileGroups';
import { ordinal } from './ordinal';
import { pointsLines } from './pointsLines';
import { wargearOptionLines } from './wargearOptionLines';

const unit = (id: string): Unit => bundledLibrary.unit('demo-host', id)!.unit;

describe('factionTheme', () => {
  const faction = { color: '#3b4a22', icon: 'orks' };

  it("uses the faction's colour and icon when the unit sets none", () => {
    expect(factionTheme({}, faction)).toEqual(faction);
  });

  it("the unit's own colour and icon win over the faction's", () => {
    expect(factionTheme({ color: '#123456', icon: 'goffs' }, faction)).toEqual({ color: '#123456', icon: 'goffs' });
  });

  it('falls back to a neutral colour and no icon when neither sets one', () => {
    expect(factionTheme({}, {})).toEqual({ color: '#3a3f44', icon: null });
    expect(factionTheme({ icon: 'skull' }, {}).icon).toBe('skull');
  });
});

function weapon(name: string, group?: string): MeleeWeapon {
  return { id: name, name, group, tags: [], A: '1', WS: '3+', S: '4', AP: '0', D: '1' };
}

describe('markProfileGroups', () => {
  it('flags every row that shares a group with another row', () => {
    const rows = markProfileGroups([
      weapon('Bolt pistol'),
      weapon('Plasma – standard', 'P'),
      weapon('Plasma – supercharge', 'P'),
    ]);

    expect(rows.map((r) => r.inGroup)).toEqual([false, true, true]);
  });

  it('a group used by only one row is not flagged', () => {
    expect(markProfileGroups([weapon('Lonely', 'L')])[0].inGroup).toBe(false);
  });

  it('an empty list stays empty', () => {
    expect(markProfileGroups([])).toEqual([]);
  });
});

describe('datasheet text', () => {
  it('lists model counts, showing a range when the count can vary', () => {
    expect(compositionLines(unit('line-troopers'))).toEqual(['1 × Sergeant', '9–19 × Trooper']);
  });

  it('lists default wargear per model type by weapon name', () => {
    expect(equipmentLines(unit('field-captain'))).toEqual([
      { model: 'Field Captain', items: 'Service pistol; Duelling sabre' },
    ]);
  });

  it('counts wargear a model carries more than once', () => {
    const carrier = unit('armoured-carrier');

    const twin = {
      ...carrier,
      composition: { ...carrier.composition, wargear: { 'Armoured Carrier': ['heavy-stubber', 'heavy-stubber'] } },
    };

    expect(equipmentLines(twin)).toEqual([{ model: 'Armoured Carrier', items: '2 × Heavy stubber' }]);
  });

  it('lists the cost of each unit size', () => {
    expect(pointsLines(unit('veteran-squad'))).toEqual(['5 models: 90 pts', '10 models: 180 pts']);
    expect(pointsLines(unit('field-captain'))).toEqual(['1 model: 70 pts']);
    expect(pointsLines(unit('line-troopers'))).toContain('Flamer: +5 pts each');
    expect(pointsLines(unit('armoured-carrier'))).toEqual(['1 model: 80 pts', '3rd+ in your army: +10 pts']);
  });

  it('writes ordinals the English way, teens included', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 103, 111].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '103rd',
      '111th',
    ]);
  });

  it('describes each kind of wargear limit, with its cost', () => {
    expect(wargearOptionLines(unit('field-captain'))).toEqual([
      'This model can replace Service pistol with Grenade launcher.',
    ]);

    expect(wargearOptionLines(unit('line-troopers'))).toEqual([
      '1 Trooper model in every 10 can replace Service rifle with Flamer.',
    ]);

    expect(wargearOptionLines(unit('veteran-squad'))).toEqual([
      'Up to 2 models can replace Carbine with Melta gun (+5 pts per model).',
    ]);
  });

  it('says who can take an enhancement, including exclusions', () => {
    const base: Enhancement = {
      id: 'x',
      name: 'X',
      points: 10,
      target: 'model',
      keywords: ['CHARACTER'],
      anyKeywords: [],
      excludeKeywords: [],
      excludeRoles: ['epic-hero'],
    };

    expect(eligibilityText(base)).toBe('CHARACTER model only (not EPIC HERO)');

    expect(eligibilityText({ ...base, target: 'unit', keywords: ['VEHICLE'], excludeRoles: [] })).toBe(
      'VEHICLE unit only',
    );

    expect(eligibilityText({ ...base, keywords: [], anyKeywords: ['IRON-MASTER', 'MEMNYR STRATEGIST'] })).toBe(
      'IRON-MASTER or MEMNYR STRATEGIST model only (not EPIC HERO)',
    );
  });
});
