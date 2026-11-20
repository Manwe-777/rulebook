import { describe, expect, it } from 'vitest';

import { demoLibraryWith } from '../testing/demoLibraryWith';
import { demoList } from '../testing/demoList';
import type { ListEntry } from '../types';
import { validateList } from './validateList';
import { wargearRoom } from './wargearRoom';

// Veterans: up to 2 can swap their carbine for a melta gun, up to 3 their blade for one, but a model takes one swap
// or the other, never both (they share a group).
const library = demoLibraryWith({
  'demo-host/veteran-squad.md': (s) =>
    s.replace(
      '  - { id: melta, per: 2, replace: [carbine], with: [[melta-gun]], points: 5 }',
      '  - { id: melta, per: 2, replace: [carbine], with: [[melta-gun]], points: 5, group: swap }\n' +
        '  - { id: blade, per: 3, replace: [combat-blade], with: [[melta-gun]], group: swap }',
    ),
});

const unit = library.unit('demo-host', 'veteran-squad')!.unit;
const option = (id: string) => unit.wargearOptions.find((o) => o.id === id)!;

const taking = (melta: number, blade: number): ListEntry['wargear'] => [
  ...(melta ? [{ option: 'melta', models: melta, choice: ['melta-gun'] }] : []),
  ...(blade ? [{ option: 'blade', models: blade, choice: ['melta-gun'] }] : []),
];

const errors = (wargear: ListEntry['wargear']) =>
  validateList(demoList({ units: demoList().units.map((u) => (u.id === 'vets' ? { ...u, wargear } : u)) }), library)
    .filter((i) => i.severity === 'error')
    .map((i) => i.code);

describe('"one or the other" wargear options', () => {
  it('options in a group together take no more models than the most generous of them allows', () => {
    expect(errors(taking(2, 1))).toEqual([]);
    expect(errors(taking(0, 3))).toEqual([]);
    expect(errors(taking(2, 2))).toEqual(['wargear-group']);
  });

  it('each option still keeps its own limit inside the group', () => {
    expect(errors(taking(3, 0))).toEqual(['wargear-limit']);
  });

  it('the room left for an option counts what the rest of its group has taken', () => {
    const vets = { models: 5, wargear: taking(2, 0) };

    expect(wargearRoom(unit, vets, option('blade'))).toBe(1);
    expect(wargearRoom(unit, vets, option('melta'))).toBe(0);
    expect(wargearRoom(unit, { models: 5, wargear: [] }, option('blade'))).toBe(3);
  });
});
