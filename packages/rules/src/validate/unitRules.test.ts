import { describe, expect, it } from 'vitest';

import type { Library } from '../library/Library';
import { demoLibraryWith } from '../testing/demoLibraryWith';
import { demoList } from '../testing/demoList';
import type { ArmyList } from '../types';
import { validateList } from './validateList';

const errors = (list: ArmyList, library: Library) =>
  validateList(list, library)
    .filter((i) => i.severity === 'error')
    .map((i) => i.code)
    .sort();

/** The demo library with constraints added to the Field Captain's datasheet. */
const captainWith = (constraints: string) =>
  demoLibraryWith({
    'demo-host/field-captain.md': (s) =>
      s.replace('factionKeywords: [DEMO HOST]', `factionKeywords: [DEMO HOST]\nconstraints:\n${constraints}`),
  });

const base = demoList();
const bearerWarlord = demoList({ warlord: 'bearer' });

const withoutCaptain = demoList({
  warlord: 'bearer',
  units: base.units.filter((u) => u.id !== 'captain'),
});

describe('rules a datasheet brings to the army', () => {
  it('"can\'t be your Warlord" is an error only when that datasheet is the warlord', () => {
    const library = captainWith(
      "  - { id: not-warlord, select: { units: { ids: [field-captain] }, warlord: true }, max: 0, message: The Field Captain can't be the Warlord. }",
    );

    expect(errors(base, library)).toEqual(['not-warlord']);
    expect(errors(bearerWarlord, library)).toEqual([]);
  });

  it('"must be your Warlord" is an error when it is taken but someone else leads the army', () => {
    const library = captainWith(
      '  - { id: must-be-warlord, select: { units: { ids: [field-captain] }, warlord: false }, max: 0, message: The Field Captain must be the Warlord. }',
    );

    expect(errors(base, library)).toEqual([]);
    expect(errors(bearerWarlord, library)).toEqual(['must-be-warlord']);
    expect(errors(withoutCaptain, library)).toEqual([]);
  });

  it('"one per army" allows one copy and reports the second', () => {
    const library = captainWith(
      '  - { id: one-captain, select: { units: { ids: [field-captain] } }, max: 1, message: Only one Field Captain. }',
    );

    const twoCaptains = demoList({ units: [...base.units, { id: 'captain2', unit: 'field-captain', models: 1 }] });

    expect(errors(base, library)).toEqual([]);
    expect(errors(twoCaptains, library)).toEqual(['one-captain']);
  });
});

describe('leaders and support units with a condition', () => {
  // The Standard Bearer leads Line Troopers, and supports them only while Marshal Venn is in the army.
  const library = demoLibraryWith({
    'demo-host/standard-bearer.md': (s) =>
      s.replace(
        'support:\n  bodyguards: [line-troopers, veteran-squad]',
        'leader:\n  bodyguards: [line-troopers]\nsupport:\n  bodyguards: [line-troopers, veteran-squad]\n  when: { has: { units: { ids: [marshal-venn] } } }',
      ),
  });

  const venn = { id: 'venn', unit: 'marshal-venn', models: 1 };

  it('a unit that can lead or support the same bodyguard supports it when a leader is already there', () => {
    expect(errors(demoList({ units: [...base.units, venn] }), library)).toEqual([]);
  });

  it('without its condition it can only lead, so a second leader is too many', () => {
    expect(errors(base, library)).toEqual(['too-many-leaders']);
  });

  it("without its condition it can't join a bodyguard it could only support", () => {
    const toVets = demoList({ units: base.units.map((u) => (u.id === 'bearer' ? { ...u, attachedTo: 'vets' } : u)) });

    expect(errors(toVets, library)).toEqual(['cannot-attach']);
    expect(errors(demoList({ units: [...toVets.units, venn] }), library)).toEqual([]);
  });

  it('a leader block with unless stops applying while its condition holds', () => {
    const captainUnlessVenn = demoLibraryWith({
      'demo-host/field-captain.md': (src) =>
        src.replace(
          'bodyguards: [line-troopers, veteran-squad]',
          'bodyguards: [line-troopers, veteran-squad]\n  unless: { has: { units: { ids: [marshal-venn] } } }',
        ),
    });

    expect(errors(base, captainUnlessVenn)).toEqual([]);
    expect(errors(demoList({ units: [...base.units, venn] }), captainUnlessVenn)).toEqual(['cannot-attach']);
  });

  it('the same rule on several datasheets is reported once', () => {
    const rule = '  - { id: no-captains, select: { units: { ids: [field-captain] } }, max: 0, message: No captains. }';

    const both = demoLibraryWith({
      'demo-host/field-captain.md': (src) =>
        src.replace('factionKeywords: [DEMO HOST]', `factionKeywords: [DEMO HOST]\nconstraints:\n${rule}`),
      'demo-host/standard-bearer.md': (src) =>
        src.replace('factionKeywords: [DEMO HOST]', `factionKeywords: [DEMO HOST]\nconstraints:\n${rule}`),
    });

    expect(errors(base, both)).toEqual(['no-captains']);
  });
});
