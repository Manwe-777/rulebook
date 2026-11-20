import { describe, expect, it } from 'vitest';

import { demoLibraryWith } from '../testing/demoLibraryWith';
import { demoList } from '../testing/demoList';
import type { ListEntry } from '../types';
import { entryLoadout } from '../utils/entryLoadout';
import { listPoints } from './listPoints';
import { validateList } from './validateList';
import { wargearAllowance } from './wargearAllowance';

// Veterans with optional Hounds, priced like Wolf Guard Headtakers: ten models cost 120 as five and five, 180 as ten
// Veterans.
const library = demoLibraryWith({
  'demo-host/veteran-squad.md': (s) =>
    s
      .replace(
        'models: [{ name: Veteran, min: 5, max: 10 }]',
        'models: [{ name: Veteran, min: 5, max: 10 }, { name: Hound, min: 0, max: 5 }]',
      )
      .replace(
        '    - { models: 10, points: 180 }',
        '    - { models: 10, points: 120, counts: { Veteran: 5, Hound: 5 } }\n    - { models: 10, points: 180, counts: { Veteran: 10 } }',
      ),
});

const vets = (change: Partial<ListEntry>) =>
  demoList({ units: demoList().units.map((u) => (u.id === 'vets' ? { ...u, wargear: [], ...change } : u)) });

const points = (change: Partial<ListEntry>) => listPoints(vets(change), library).entries.vets;

const errors = (change: Partial<ListEntry>) =>
  validateList(vets(change), library)
    .filter((i) => i.severity === 'error')
    .map((i) => i.code);

describe('sizes that depend on which models a unit has', () => {
  it('the same number of models costs what its mix of model types costs', () => {
    expect(points({ models: 10, counts: { Veteran: 5, Hound: 5 } })).toBe(120);
    expect(points({ models: 10, counts: { Veteran: 10 } })).toBe(180);
    expect(points({ models: 10, counts: { Veteran: 10, Hound: 0 } })).toBe(180);
  });

  it('without counts, an entry is the first size with its number of models', () => {
    expect(points({ models: 10 })).toBe(120);
    expect(errors({ models: 10 })).toEqual([]);
  });

  it('a mix the datasheet has no price for is not a legal size', () => {
    expect(errors({ models: 10, counts: { Veteran: 7, Hound: 3 } })).toEqual(['unit-size']);
    expect(errors({ models: 10, counts: { Veteran: 10 } })).toEqual([]);
  });

  it('what the models carry and what they can swap follow the chosen mix', () => {
    const tenVeterans = { models: 10, counts: { Veteran: 10 } };
    const types = entryLoadout(library.unit('demo-host', 'veteran-squad')!.unit, { ...vets(tenVeterans).units[2] });

    expect(types.map((t) => [t.type, t.count])).toEqual([
      ['Veteran', 10],
      ['Hound', 0],
    ]);

    const unit = library.unit('demo-host', 'veteran-squad')!.unit;
    const option = { ...unit.wargearOptions[0], models: 'Veteran', per: 'all' as const };

    expect(wargearAllowance(unit, tenVeterans, option)).toBe(10);
    expect(wargearAllowance(unit, { models: 10, counts: { Veteran: 5, Hound: 5 } }, option)).toBe(5);
  });
});
