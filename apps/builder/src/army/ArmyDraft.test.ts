import { Library, validateList } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../sources/loadBundledFiles';
import { ArmyDraft } from './ArmyDraft';

const library = Library.fromFiles(loadBundledFiles());
const FACTION = 'demo-host';

const errors = (draft: ArmyDraft) => validateList(draft.list, library).filter((i) => i.severity === 'error');

describe('ArmyDraft', () => {
  it('a new list uses the default battle size and the first detachment, with no units', () => {
    const draft = ArmyDraft.create(library, FACTION);

    expect(draft.list).toMatchObject({
      faction: FACTION,
      battleSize: 'strike-force',
      detachments: ['armoured-column'],
      units: [],
    });
  });

  it('a new unit gets its smallest size and an id unique in the list', () => {
    const first = ArmyDraft.create(library, FACTION).addUnit(library, 'veteran-squad');
    const second = first.draft.addUnit(library, 'veteran-squad');

    expect(first.draft.entry(first.id)?.models).toBe(5);
    expect(second.id).not.toBe(first.id);
    expect(second.draft.list.units).toHaveLength(2);
  });

  it('removing a unit detaches what was attached to it and clears it as warlord', () => {
    let draft = ArmyDraft.create(library, FACTION);
    const troopers = draft.addUnit(library, 'line-troopers');
    const captain = troopers.draft.addUnit(library, 'field-captain');

    draft = captain.draft.attach(captain.id, troopers.id).setWarlord(troopers.id).removeUnit(troopers.id);

    expect(draft.entry(captain.id)?.attachedTo).toBeUndefined();
    expect(draft.list.warlord).toBeUndefined();
  });

  it('dropping a detachment drops the enhancements and upgrades it offered, keeping the others', () => {
    let draft = ArmyDraft.create(library, FACTION).toggleDetachment(library, 'shield-wall');
    const captain = draft.addUnit(library, 'field-captain');
    const carrier = captain.draft.addUnit(library, 'armoured-carrier');

    draft = carrier.draft.setEnhancement(captain.id, 'banner-of-resolve').setUpgrade(carrier.id, 'overcharged-engines');
    draft = draft.toggleDetachment(library, 'shield-wall');

    expect(draft.list.detachments).toEqual(['armoured-column']);
    expect(draft.entry(captain.id)?.enhancement).toBeUndefined();
    expect(draft.entry(carrier.id)?.upgrade).toBe('overcharged-engines');
  });

  it('setting wargear to 0 models removes the option, and changing it replaces the old row', () => {
    const vets = ArmyDraft.create(library, FACTION).addUnit(library, 'veteran-squad');
    const two = vets.draft.setWargear(vets.id, 'melta', 2, ['melta-gun']);

    expect(two.setWargear(vets.id, 'melta', 1, ['melta-gun']).entry(vets.id)?.wargear).toEqual([
      { option: 'melta', models: 1, choice: ['melta-gun'] },
    ]);

    expect(two.setWargear(vets.id, 'melta', 0, ['melta-gun']).entry(vets.id)?.wargear).toEqual([]);
  });

  it('changes never touch the previous draft', () => {
    const before = ArmyDraft.create(library, FACTION);
    const after = before.addUnit(library, 'line-troopers').draft.rename('Changed');

    expect(before.list.units).toEqual([]);
    expect(before.list.name).not.toBe('Changed');
    expect(after.list.units).toHaveLength(1);
  });

  it('a list built step by step is legal', () => {
    let draft = ArmyDraft.create(library, FACTION);
    const troopers = draft.addUnit(library, 'line-troopers');
    const captain = troopers.draft.addUnit(library, 'field-captain');

    draft = captain.draft.attach(captain.id, troopers.id).setWarlord(captain.id);

    expect(errors(draft)).toEqual([]);
  });

  it('a saved list comes back the same; anything else is refused', () => {
    const draft = ArmyDraft.create(library, FACTION).addUnit(library, 'line-troopers').draft;

    expect(ArmyDraft.fromSave(JSON.parse(JSON.stringify(draft)))?.list).toEqual(draft.list);
    expect(ArmyDraft.fromSave({ units: 'nope' })).toBeNull();
    expect(ArmyDraft.fromSave(null)).toBeNull();
  });
});
