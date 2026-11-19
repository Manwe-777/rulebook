import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../sources/loadBundledFiles';
import { checkChange } from './checkChange';
import { lineDiff } from './lineDiff';
import { recordSource } from './recordSource';
import { recordTemplate } from './recordTemplate';

const files = loadBundledFiles();
const FACTION = 'demo-host';

describe('recordSource', () => {
  it('finds a record by kind and id, and the faction record by kind alone', () => {
    expect(recordSource(files, FACTION, 'unit', 'field-captain')).toMatch(/name: Field Captain/);
    expect(recordSource(files, FACTION, 'faction', FACTION)).toMatch(/kind: faction/);
    expect(recordSource(files, 'core', 'muster', 'matched-play')).toMatch(/kind: muster/);
  });

  it('gives nothing for a record that does not exist', () => {
    expect(recordSource(files, FACTION, 'unit', 'dragon')).toBeUndefined();
    expect(recordSource(files, FACTION, 'detachment', 'field-captain')).toBeUndefined();
  });
});

describe('checkChange', () => {
  const captain = recordSource(files, FACTION, 'unit', 'field-captain')!;

  it('an unchanged record has no problems', () => {
    expect(checkChange(files, FACTION, 'unit', 'field-captain', captain)).toMatchObject({ errors: [], issues: [] });
  });

  it("reports the edited record's own mistakes", () => {
    const { errors } = checkChange(files, FACTION, 'unit', 'field-captain', captain.replace('W: 5', 'W: '));

    expect(errors).toEqual([expect.stringMatching(/^profiles\.0\.W:/)]);
  });

  it('reports what the change breaks elsewhere in the faction', () => {
    const { issues } = checkChange(
      files,
      FACTION,
      'unit',
      'field-captain',
      captain.replace('line-troopers, veteran-squad', 'scouts'),
    );

    expect(issues.map((i) => i.code)).toEqual(['unknown-bodyguard']);
  });

  it('the preview library holds the change, also when the id is new', () => {
    const { library, id } = checkChange(
      files,
      FACTION,
      'unit',
      'field-captain',
      captain.replace('name: Field Captain', 'name: Field Major'),
    );

    const renamed = checkChange(files, FACTION, 'unit', 'scouts', recordTemplate('unit', 'Scouts', 'DEMO HOST'));

    expect(library.unit(FACTION, id)?.unit.name).toBe('Field Major');
    expect(renamed.errors).toEqual([]);
    expect(renamed.library.unit(FACTION, 'scouts')).toBeDefined();
  });
});

describe('recordTemplate', () => {
  it('new units and detachments start valid and pass the dataset checks', () => {
    for (const kind of ['unit', 'detachment'] as const) {
      const { errors, issues } = checkChange(
        files,
        FACTION,
        kind,
        'new',
        recordTemplate(kind, 'Brand New', 'DEMO HOST'),
      );

      expect(errors).toEqual([]);
      expect(issues).toEqual([]);
    }
  });
});

describe('lineDiff', () => {
  it('marks added and removed lines, keeping the rest', () => {
    expect(lineDiff('a\nb\nc', 'a\nB\nc\nd')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'added', text: 'B' },
      { type: 'removed', text: 'b' },
      { type: 'same', text: 'c' },
      { type: 'added', text: 'd' },
    ]);
  });

  it('identical texts have no changes, and an empty text is all additions', () => {
    expect(lineDiff('x\ny', 'x\ny').every((l) => l.type === 'same')).toBe(true);

    expect(lineDiff('', 'x').filter((l) => l.type !== 'same')).toEqual([
      { type: 'added', text: 'x' },
      { type: 'removed', text: '' },
    ]);
  });
});
