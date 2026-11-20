import { describe, expect, it } from 'vitest';

import { Library } from '../library/Library';
import { loadDemoFiles } from '../testing/loadDemoFiles';
import { checkDataset } from './checkDataset';

/** The demo content with one file edited, checked. */
function checkEdited(file: string, from: string, to: string) {
  const files = loadDemoFiles().map((f) => {
    if (!f.path.endsWith(file)) return f;
    if (!f.source.includes(from)) throw new Error(`"${from}" is not in ${file}`);

    return { ...f, source: f.source.replace(from, to) };
  });

  const library = Library.fromFiles(files);

  expect(library.errors).toEqual([]);

  return checkDataset(library).map((i) => [i.code, i.severity, i.entries[0]]);
}

describe('checkDataset', () => {
  it('the demo content has no problems', () => {
    expect(checkDataset(Library.fromFiles(loadDemoFiles()))).toEqual([]);
  });

  it('warns about a detachment whose force disposition the muster rules do not list, or that has none', () => {
    expect(checkEdited('shield-wall.md', 'dispositions: [take-and-hold]', 'dispositions: [hold-the-line]')).toEqual([
      ['unknown-disposition', 'warning', 'demo-host/shield-wall'],
    ]);

    expect(checkEdited('shield-wall.md', 'dispositions: [take-and-hold]\n', '')).toEqual([
      ['unknown-disposition', 'warning', 'demo-host/shield-wall'],
    ]);
  });

  it('reports wargear that names a weapon the datasheet does not have', () => {
    expect(checkEdited('veteran-squad.md', 'with: [[melta-gun]]', 'with: [[lascannon]]')).toEqual([
      ['unknown-weapon', 'error', 'demo-host/veteran-squad'],
    ]);
  });

  it('reports default wargear or options for a model type the unit does not have', () => {
    expect(checkEdited('line-troopers.md', 'models: Trooper,', 'models: Gunner,')).toEqual([
      ['unknown-model', 'error', 'demo-host/line-troopers'],
    ]);
  });

  it('reports a cost for a unit size the unit cannot have, and a size listed twice', () => {
    expect(checkEdited('veteran-squad.md', '{ models: 10, points: 180 }', '{ models: 11, points: 180 }')).toEqual([
      ['size-out-of-range', 'error', 'demo-host/veteran-squad'],
    ]);

    expect(checkEdited('veteran-squad.md', '{ models: 10, points: 180 }', '{ models: 5, points: 180 }')).toEqual([
      ['size-twice', 'error', 'demo-host/veteran-squad'],
    ]);
  });

  it('reports a leader that can join a unit the faction does not have', () => {
    expect(
      checkEdited(
        'field-captain.md',
        'bodyguards: [line-troopers, veteran-squad]',
        'bodyguards: [line-troopers, scouts]',
      ),
    ).toEqual([['unknown-bodyguard', 'error', 'demo-host/field-captain']]);
  });

  it('warns when the Leader ability and the leader list disagree', () => {
    expect(
      checkEdited('field-captain.md', 'coreAbilities: [Leader, Deep Strike]', 'coreAbilities: [Deep Strike]'),
    ).toEqual([['leader-mismatch', 'warning', 'demo-host/field-captain']]);
  });

  it("warns about a unit without the faction's keyword", () => {
    expect(checkEdited('veteran-squad.md', 'factionKeywords: [DEMO HOST]', 'factionKeywords: [OTHER HOST]')).toEqual([
      ['missing-faction-keyword', 'warning', 'demo-host/veteran-squad'],
    ]);
  });

  it("doesn't warn about a unit without the keyword when the faction's own rules let it in as an ally", () => {
    const ally =
      'factionKeywords: [OTHER HOST]\nconstraints:\n  - { id: ally, allow: faction, select: { units: { ids: [veteran-squad] } }, message: Allies. }';

    expect(checkEdited('veteran-squad.md', 'factionKeywords: [DEMO HOST]', ally)).toEqual([]);
  });

  it('warns about enhancements and stratagems without text', () => {
    expect(checkEdited('armoured-column.md', 'Upgrade. Add 2" to this unit\'s Move characteristic.', '')).toEqual([
      ['missing-text', 'warning', 'demo-host/armoured-column'],
    ]);
  });

  it('reports constraints that refer to units or detachments the faction does not have', () => {
    expect(checkEdited('rapid-response.md', 'ids: [veteran-squad]', 'ids: [scouts]')).toEqual([
      ['unknown-reference', 'error', 'demo-host/rapid-response'],
    ]);

    expect(
      checkEdited('rapid-response.md', 'when: { detachment: rapid-response }', 'when: { detachment: rapid }'),
    ).toEqual([['unknown-reference', 'error', 'demo-host/rapid-response']]);
  });

  it("reports a datasheet's own rules and leader conditions that refer to units the faction does not have", () => {
    const rule =
      'factionKeywords: [DEMO HOST]\nconstraints:\n  - { id: one, select: { units: { ids: [nobody] } }, max: 1, message: x }';

    expect(checkEdited('field-captain.md', 'factionKeywords: [DEMO HOST]', rule)).toEqual([
      ['unknown-reference', 'error', 'demo-host/field-captain'],
    ]);

    expect(
      checkEdited(
        'standard-bearer.md',
        'bodyguards: [line-troopers, veteran-squad]',
        'bodyguards: [line-troopers, veteran-squad]\n  when: { has: { units: { ids: [nobody] } } }',
      ),
    ).toEqual([['unknown-reference', 'error', 'demo-host/standard-bearer']]);
  });

  it('reports a size whose model counts are unknown types or do not add up to the size', () => {
    expect(
      checkEdited(
        'veteran-squad.md',
        '{ models: 10, points: 180 }',
        '{ models: 10, points: 180, counts: { Veteran: 9 } }',
      ),
    ).toEqual([['size-counts', 'error', 'demo-host/veteran-squad']]);

    expect(
      checkEdited(
        'veteran-squad.md',
        '{ models: 10, points: 180 }',
        '{ models: 10, points: 180, counts: { Hound: 10 } }',
      ),
    ).toEqual([
      ['unknown-model', 'error', 'demo-host/veteran-squad'],
      ['size-counts', 'error', 'demo-host/veteran-squad'],
    ]);
  });

  it('reports missing muster rules, and warns when no datasheet limit applies by default', () => {
    expect(checkDataset(Library.fromFiles(loadDemoFiles().filter((f) => !f.path.includes('core/'))))).toEqual([
      expect.objectContaining({ code: 'no-muster-rules', severity: 'error' }),
    ]);

    expect(checkEdited('muster.md', '  - { role: default, max: 3 }\n', '')).toEqual([
      ['no-default-limit', 'warning', 'core'],
    ]);
  });
});
