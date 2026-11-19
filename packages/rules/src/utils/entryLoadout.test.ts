import { describe, expect, it } from 'vitest';

import { Library } from '../library/Library';
import { loadDemoFiles } from '../testing/loadDemoFiles';
import type { ListEntry } from '../types';
import { entryLoadout } from './entryLoadout';
import { modelCounts } from './modelCounts';

const library = Library.fromFiles(loadDemoFiles());
const unit = (id: string) => library.unit('demo-host', id)!.unit;

const entry = (unitId: string, models: number, wargear: ListEntry['wargear'] = []): ListEntry =>
  ({ id: 'e', unit: unitId, models, wargear }) as ListEntry;

describe('modelCounts', () => {
  it('fills every minimum, then grows the types that can grow', () => {
    expect(modelCounts(unit('line-troopers'), 20)).toEqual([
      { type: 'Sergeant', count: 1 },
      { type: 'Trooper', count: 19 },
    ]);

    expect(modelCounts(unit('line-troopers'), 10)).toEqual([
      { type: 'Sergeant', count: 1 },
      { type: 'Trooper', count: 9 },
    ]);
  });

  it('never goes past a maximum, even for a size the datasheet does not allow', () => {
    expect(modelCounts(unit('line-troopers'), 40)[1]).toEqual({ type: 'Trooper', count: 19 });
  });
});

describe('entryLoadout', () => {
  it('without choices every model carries its default wargear', () => {
    expect(entryLoadout(unit('line-troopers'), entry('line-troopers', 10))).toEqual([
      {
        type: 'Sergeant',
        count: 1,
        items: [
          { id: 'service-pistol', count: 1 },
          { id: 'close-combat-weapon', count: 1 },
          { id: 'signal-flare', count: 1 },
        ],
      },
      {
        type: 'Trooper',
        count: 9,
        items: [
          { id: 'service-rifle', count: 9 },
          { id: 'close-combat-weapon', count: 9 },
        ],
      },
    ]);
  });

  it('a swap takes the replaced weapon from as many models as chose it', () => {
    const [vets] = entryLoadout(
      unit('veteran-squad'),
      entry('veteran-squad', 10, [{ option: 'melta', models: 2, choice: ['melta-gun'] }]),
    );

    expect(vets.items).toEqual([
      { id: 'carbine', count: 8 },
      { id: 'combat-blade', count: 10 },
      { id: 'melta-gun', count: 2 },
    ]);
  });

  it('an option for a named model type only changes that type', () => {
    const [sergeant, troopers] = entryLoadout(
      unit('line-troopers'),
      entry('line-troopers', 10, [{ option: 'flamer', models: 1, choice: ['flamer'] }]),
    );

    expect(sergeant.items.map((i) => i.id)).not.toContain('flamer');
    expect(troopers.items).toContainEqual({ id: 'flamer', count: 1 });
    expect(troopers.items).toContainEqual({ id: 'service-rifle', count: 8 });
  });

  it('never takes away more than the models carry, whatever the saved list says', () => {
    const [vets] = entryLoadout(
      unit('veteran-squad'),
      entry('veteran-squad', 5, [{ option: 'melta', models: 9, choice: ['melta-gun'] }]),
    );

    expect(vets.items).toEqual([
      { id: 'combat-blade', count: 5 },
      { id: 'melta-gun', count: 5 },
    ]);
  });
});
