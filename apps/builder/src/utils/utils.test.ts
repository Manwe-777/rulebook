import { Library } from '@rulebook/rules';
import { afterEach, describe, expect, it } from 'vitest';

import { ArmyDraft } from '../army/ArmyDraft';
import { BACKUP_KEY, STORAGE_KEY } from '../constants';
import { loadBundledFiles } from '../sources/loadBundledFiles';
import { attachTargets } from './attachTargets';
import { itemOptions } from './itemOptions';
import { loadSavedDraft } from './loadSavedDraft';
import { saveDraft } from './saveDraft';

const library = Library.fromFiles(loadBundledFiles());

describe('saving and loading the list', () => {
  afterEach(() => localStorage.clear());

  it('a saved list loads back the same', () => {
    const draft = ArmyDraft.create(library, 'demo-host').addUnit(library, 'line-troopers').draft;

    saveDraft(draft);

    expect(loadSavedDraft()?.list).toEqual(draft.list);
  });

  it('nothing saved gives no list', () => {
    expect(loadSavedDraft()).toBeNull();
  });

  it('a save that is not a list, or not even JSON, is backed up instead of crashing', () => {
    localStorage.setItem(STORAGE_KEY, '{"units": 3}');

    expect(loadSavedDraft()).toBeNull();
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{"units": 3}');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    localStorage.setItem(STORAGE_KEY, '{broken');

    expect(loadSavedDraft()).toBeNull();
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{broken');
  });
});

describe('form options', () => {
  let draft = ArmyDraft.create(library, 'demo-host').toggleDetachment(library, 'shield-wall');
  const troopers = draft.addUnit(library, 'line-troopers');
  const vets = troopers.draft.addUnit(library, 'veteran-squad');
  const carrier = vets.draft.addUnit(library, 'armoured-carrier');
  const captain = carrier.draft.addUnit(library, 'field-captain');

  draft = captain.draft;

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

  it('offers enhancements and upgrades from the chosen detachments only', () => {
    expect(itemOptions(draft.list, library, 'model').map((e) => e.id)).toEqual(['banner-of-resolve', 'old-campaigner']);

    expect(itemOptions(draft.list, library, 'unit').map((e) => e.id)).toEqual([
      'overcharged-engines',
      'reinforced-plating',
    ]);
  });
});
