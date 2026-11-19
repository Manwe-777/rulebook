import { Library } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../sources/loadBundledFiles';
import { ArmyDraft } from './ArmyDraft';
import { SavedArmies } from './SavedArmies';

const library = Library.fromFiles(loadBundledFiles());
const army = (name: string) => ArmyDraft.create(library, 'demo-host').rename(name);

describe('SavedArmies', () => {
  it('lists armies newest first and gives each back as a draft', () => {
    const saved = SavedArmies.empty().put('a', army('Alpha'), 1).put('b', army('Bravo'), 2);

    expect(saved.all.map((a) => a.id)).toEqual(['b', 'a']);
    expect(saved.draft('a')?.list.name).toBe('Alpha');
    expect(saved.draft('missing')).toBeNull();
  });

  it('saving an army again replaces it and moves it to the top', () => {
    const saved = SavedArmies.empty()
      .put('a', army('Alpha'), 1)
      .put('b', army('Bravo'), 2)
      .put('a', army('Alpha 2'), 3);

    expect(saved.size).toBe(2);

    expect(saved.all.map((a) => [a.id, a.list.name])).toEqual([
      ['a', 'Alpha 2'],
      ['b', 'Bravo'],
    ]);
  });

  it('a duplicate is a separate army named as a copy; changing it leaves the original alone', () => {
    const start = SavedArmies.empty().put('a', army('Alpha').addUnit(library, 'line-troopers').draft, 1);
    const copied = start.duplicate('a', 'c', 2);
    const changed = copied.put('c', copied.draft('c')!.rename('Changed'), 3);

    expect(copied.draft('c')?.list.name).toBe('Alpha (copy)');
    expect(copied.draft('c')?.list.units).toEqual(start.draft('a')?.list.units);
    expect(changed.draft('a')?.list.name).toBe('Alpha');
  });

  it('removing an army keeps the others', () => {
    const saved = SavedArmies.empty().put('a', army('Alpha'), 1).put('b', army('Bravo'), 2).remove('a');

    expect(saved.all.map((a) => a.id)).toEqual(['b']);
  });

  it('survives a save and reload', () => {
    const saved = SavedArmies.empty().put('a', army('Alpha'), 1);

    expect(SavedArmies.fromSave(JSON.parse(JSON.stringify(saved)))?.all).toEqual(saved.all);
  });

  it('one unreadable army is kept aside without losing the others', () => {
    const good = SavedArmies.empty().put('a', army('Alpha'), 1).toJSON();
    const loaded = SavedArmies.fromSave({ armies: [...good.armies, { id: 'b', list: { units: 3 } }, null] })!;

    expect(loaded.all.map((a) => a.id)).toEqual(['a']);
    expect(loaded.unreadable).toHaveLength(2);
  });

  it('unreadable armies are still there after the others are saved again', () => {
    const loaded = SavedArmies.fromSave({ armies: [{ id: 'b', list: { units: 3 } }] })!;
    const resaved = SavedArmies.fromSave(JSON.parse(JSON.stringify(loaded.put('a', army('Alpha'), 1))))!;

    expect(resaved.unreadable).toEqual([{ id: 'b', list: { units: 3 } }]);
  });

  it('data that is not a list of armies is not read at all', () => {
    expect(SavedArmies.fromSave({ name: 'old single list' })).toBeNull();
    expect(SavedArmies.fromSave(null)).toBeNull();
  });
});
