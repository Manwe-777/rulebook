import { describe, expect, it } from 'vitest';

import { demoLibraryWith } from '../testing/demoLibraryWith';
import { demoList } from '../testing/demoList';
import type { ListEntry } from '../types';
import { validateList } from './validateList';

// Every Line Trooper, Sergeant included, carries a service rifle. Troopers can swap theirs for a flamer, and any
// model for a pistol: ten rifles to go round.
const library = demoLibraryWith({
  'demo-host/line-troopers.md': (s) =>
    s
      .replace('Sergeant: [service-pistol,', 'Sergeant: [service-rifle,')
      .replace(
        '  - { id: flamer, models: Trooper, per: { every: 10 }, replace: [service-rifle], with: [[flamer]] }',
        '  - { id: flamer, models: Trooper, per: 9, replace: [service-rifle], with: [[flamer]] }\n' +
          '  - { id: pistol, replace: [service-rifle], with: [[service-pistol]] }',
      ),
});

const flamers = (models: number) => ({ option: 'flamer', models, choice: ['flamer'] });
const pistols = (models: number) => ({ option: 'pistol', models, choice: ['service-pistol'] });

const errors = (wargear: ListEntry['wargear']) =>
  validateList(demoList({ units: demoList().units.map((u) => (u.id === 'troopers' ? { ...u, wargear } : u)) }), library)
    .filter((i) => i.severity === 'error')
    .map((i) => i.code);

describe('swaps need models still carrying what they replace', () => {
  it('two swaps of the same weapon can share the models that carry it', () => {
    expect(errors([flamers(9), pistols(1)])).toEqual([]);
  });

  it('a swap with nothing left to replace is an error', () => {
    expect(errors([flamers(9), pistols(2)])).toEqual(['wargear-replace']);
  });

  it('a swap open to any model leaves the models a typed swap needs, whatever the list order', () => {
    expect(errors([pistols(1), flamers(9)])).toEqual([]);
  });
});
