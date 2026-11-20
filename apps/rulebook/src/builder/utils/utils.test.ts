import { Library } from '@rulebook/rules';
import { afterEach, describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../../sources/loadBundledFiles';
import { ArmyDraft } from '../army/ArmyDraft';
import { SavedArmies } from '../army/SavedArmies';
import { ARMIES_BACKUP_KEY, ARMIES_KEY, LEGACY_LIST_KEY } from '../constants';
import { attachTargets } from './attachTargets';
import { itemOptions } from './itemOptions';
import { loadSavedArmies } from './loadSavedArmies';
import { optionLabel } from './optionLabel';
import { saveArmies } from './saveArmies';

const library = Library.fromFiles(loadBundledFiles());

describe('saving and loading armies', () => {
  afterEach(() => localStorage.clear());

  it('saved armies load back the same', () => {
    const draft = ArmyDraft.create(library, 'demo-host').addUnit(library, 'line-troopers').draft;
    const saved = SavedArmies.empty().put('a', draft, 5);

    saveArmies(saved);

    expect(loadSavedArmies().all).toEqual(saved.all);
  });

  it('nothing saved gives no armies', () => {
    expect(loadSavedArmies().size).toBe(0);
  });

  it('the single list an earlier version saved becomes the first army, once', () => {
    const old = ArmyDraft.create(library, 'demo-host').rename('My old list');

    localStorage.setItem(LEGACY_LIST_KEY, JSON.stringify(old));

    expect(loadSavedArmies().all.map((a) => a.list.name)).toEqual(['My old list']);
    expect(localStorage.getItem(LEGACY_LIST_KEY)).toBeNull();
    expect(loadSavedArmies().size).toBe(1);
  });

  it('saved data that is not armies, or not even JSON, is backed up instead of crashing', () => {
    localStorage.setItem(ARMIES_KEY, '{broken');

    expect(loadSavedArmies().size).toBe(0);
    expect(localStorage.getItem(ARMIES_BACKUP_KEY)).toBe('{broken');
  });
});

describe('form options', () => {
  let draft = ArmyDraft.create(library, 'demo-host').toggleDetachment(library, 'shield-wall');
  const troopers = draft.addUnit(library, 'line-troopers');
  const vets = troopers.draft.addUnit(library, 'veteran-squad');
  const carrier = vets.draft.addUnit(library, 'armoured-carrier');
  const captain = carrier.draft.addUnit(library, 'field-captain');

  draft = captain.draft;

  it('wargear options say what they swap, and for which model type when the unit has several', () => {
    const unit = (id: string) => library.unit('demo-host', id)!.unit;

    expect(optionLabel(unit('line-troopers'), unit('line-troopers').wargearOptions[0])).toBe(
      'Trooper: swap Service rifle',
    );

    expect(optionLabel(unit('field-captain'), unit('field-captain').wargearOptions[0])).toBe('Swap Service pistol');
  });

  it('a leader can join the bodyguards on its datasheet that are in the list', () => {
    const targets = attachTargets(draft.list, library, draft.entry(captain.id)!);

    expect(targets.map((e) => e.id)).toEqual([troopers.id, vets.id]);
  });

  it('units that are attached themselves are not offered as bodyguards', () => {
    const bearer = draft.addUnit(library, 'standard-bearer');
    const withBearer = bearer.draft.attach(bearer.id, troopers.id);

    expect(attachTargets(withBearer.list, library, withBearer.entry(captain.id)!).map((e) => e.id)).not.toContain(
      bearer.id,
    );
  });

  it('offers the enhancements and upgrades of the chosen detachments that the unit can take', () => {
    const unit = (id: string) => library.unit('demo-host', id)!.unit;

    const ids = (target: 'model' | 'unit', id: string, current?: string) =>
      itemOptions(draft.list, library, target, unit(id), current).map((e) => e.id);

    expect(ids('model', 'field-captain')).toEqual(['banner-of-resolve', 'old-campaigner']);
    expect(ids('model', 'standard-bearer')).toEqual(['old-campaigner']);
    expect(ids('model', 'line-troopers')).toEqual([]);
    expect(ids('unit', 'armoured-carrier')).toEqual(['overcharged-engines', 'reinforced-plating']);
    expect(ids('unit', 'line-troopers')).toEqual([]);
  });

  it('keeps offering the item a unit already has, even when it no longer fits', () => {
    const troopers = library.unit('demo-host', 'line-troopers')!.unit;

    expect(itemOptions(draft.list, library, 'unit', troopers, 'reinforced-plating').map((e) => e.id)).toEqual([
      'reinforced-plating',
    ]);
  });
});
