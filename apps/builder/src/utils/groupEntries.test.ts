import { Library } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { ArmyDraft } from '../army/ArmyDraft';
import { loadBundledFiles } from '../sources/loadBundledFiles';
import { groupEntries } from './groupEntries';

const library = Library.fromFiles(loadBundledFiles());

function army() {
  const troopers = ArmyDraft.create(library, 'demo-host').addUnit(library, 'line-troopers');
  const vets = troopers.draft.addUnit(library, 'veteran-squad');
  const captain = vets.draft.addUnit(library, 'field-captain');
  const bearer = captain.draft.addUnit(library, 'standard-bearer');

  return { draft: bearer.draft, troopers: troopers.id, vets: vets.id, captain: captain.id, bearer: bearer.id };
}

const shape = (draft: ArmyDraft) =>
  groupEntries(draft.list).map((g) => [g.unit.id, ...g.attached.map((e) => `+${e.id}`)]);

describe('groupEntries', () => {
  it('without attachments every unit stands on its own, in the order added', () => {
    const a = army();

    expect(shape(a.draft)).toEqual([[a.troopers], [a.vets], [a.captain], [a.bearer]]);
  });

  it('an attached character moves into its bodyguard’s group, wherever it was added', () => {
    const a = army();

    expect(shape(a.draft.attach(a.captain, a.vets))).toEqual([[a.troopers], [a.vets, `+${a.captain}`], [a.bearer]]);
  });

  it('a leader and a support unit on the same bodyguard both join it, in the order they were added', () => {
    const a = army();
    const both = a.draft.attach(a.bearer, a.troopers).attach(a.captain, a.troopers);

    expect(shape(both)).toEqual([[a.troopers, `+${a.captain}`, `+${a.bearer}`], [a.vets]]);
  });

  it('detaching puts the character back on its own, where it was added', () => {
    const a = army();

    expect(shape(a.draft.attach(a.captain, a.vets).attach(a.captain, undefined))).toEqual(shape(a.draft));
  });

  it('an attachment to a unit that is gone or attached itself is shown on its own, so nothing disappears', () => {
    const a = army();

    const broken = ArmyDraft.fromSave({
      ...a.draft.list,
      units: a.draft.list.units.map((e) =>
        e.id === a.captain
          ? { ...e, attachedTo: 'missing-1' }
          : e.id === a.bearer
            ? { ...e, attachedTo: a.captain }
            : e,
      ),
    })!;

    expect(groupEntries(broken.list).flatMap((g) => [g.unit, ...g.attached])).toHaveLength(4);
    expect(shape(broken)).toEqual([[a.troopers], [a.vets], [a.captain], [a.bearer]]);
  });
});
