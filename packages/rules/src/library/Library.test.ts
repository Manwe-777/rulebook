import { describe, expect, it } from 'vitest';

import { loadDemoFiles } from '../testing/loadDemoFiles';
import { Library } from './Library';

const faction = (name: string) => `---\nkind: faction\nname: ${name}\nfactionKeyword: X\n---\n\n## Army rule\n\nText\n`;

const unit = (name: string) => `---
kind: unit
name: ${name}
profiles: [{ name: ${name}, M: 6", T: 4, Sv: 3+, W: 2, Ld: 6+, OC: 1 }]
composition: { models: [{ name: ${name}, min: 1, max: 1 }], points: [{ models: 1, points: 50 }] }
keywords: [Infantry]
factionKeywords: [X]
---
`;

const detachment = (name: string) => `---\nkind: detachment\nname: ${name}\n---\n`;

const muster = `---
kind: muster
name: M
battleSizes: [{ id: s, name: S, points: 1000 }]
detachments: { min: 1, max: 1 }
datasheetLimits: [{ role: default, max: 3 }]
enhancements: { max: 3 }
upgrades: { max: 3 }
warlord: {}
attachments: {}
strategicReserves: { maxShare: 0.5 }
---
`;

describe('Library', () => {
  it('groups units and detachments under the faction of their folder, sorted by name', () => {
    const lib = Library.fromFiles([
      { path: 'content/orks/nobz.md', source: unit('Nobz') },
      { path: 'content/marines/faction.md', source: faction('Marines') },
      { path: 'content/orks/boyz.md', source: unit('Boyz') },
      { path: 'content/orks/waaagh.md', source: detachment('Waaagh') },
      { path: 'content/orks/faction.md', source: faction('Orks') },
    ]);

    expect(lib.errors).toEqual([]);
    expect(lib.factions.map((f) => f.name)).toEqual(['Marines', 'Orks']);
    expect(lib.faction('orks')!.units.map((u) => u.name)).toEqual(['Boyz', 'Nobz']);
    expect(lib.faction('orks')!.detachments.map((d) => d.id)).toEqual(['waaagh']);
    expect(lib.faction('orks')!.body).toBe('## Army rule\n\nText');
  });

  it('a unit in a folder without faction.md is reported, not shown', () => {
    const lib = Library.fromFiles([{ path: 'orks/boyz.md', source: unit('Boyz') }]);

    expect(lib.factions).toEqual([]);
    expect(lib.errors).toEqual([{ path: 'orks/boyz.md', errors: [expect.stringMatching(/no faction\.md/)] }]);
  });

  it('a broken faction.md hides its units and reports both the faction and the units', () => {
    const lib = Library.fromFiles([
      { path: 'orks/faction.md', source: '---\nkind: faction\ncolour: red\n---\n' },
      { path: 'orks/boyz.md', source: unit('Boyz') },
    ]);

    expect(lib.factions).toEqual([]);
    expect(lib.errors.map((e) => e.path)).toEqual(['orks/boyz.md', 'orks/faction.md']);
  });

  it('a broken unit is reported while the rest of its faction still loads', () => {
    const lib = Library.fromFiles([
      { path: 'orks/faction.md', source: faction('Orks') },
      { path: 'orks/boyz.md', source: unit('Boyz') },
      { path: 'orks/grots.md', source: '---\nkind: unit\nname: Grots\n---\n' },
    ]);

    expect(lib.faction('orks')!.units.map((u) => u.id)).toEqual(['boyz']);
    expect(lib.errors.map((e) => e.path)).toEqual(['orks/grots.md']);
  });

  it('two records of the same kind with one id: the second is reported', () => {
    const lib = Library.fromFiles([
      { path: 'orks/faction.md', source: faction('Orks') },
      { path: 'orks/boyz.md', source: unit('Boyz') },
      { path: 'orks/more-boyz.md', source: unit('Boyz').replace('name: Boyz', 'id: boyz\nname: Boyz') },
    ]);

    expect(lib.faction('orks')!.units).toHaveLength(1);
    expect(lib.errors).toEqual([{ path: 'orks/more-boyz.md', errors: ['id "boyz" is used twice'] }]);
  });

  it('records in the wrong place are reported', () => {
    const lib = Library.fromFiles([
      { path: 'orks/faction.md', source: unit('Boyz') },
      { path: 'orks/rules.md', source: muster },
      { path: 'core/boyz.md', source: unit('Boyz') },
      { path: 'content/boyz.md', source: unit('Boyz') },
    ]);

    expect(lib.errors.map((e) => e.path)).toEqual([
      'content/boyz.md',
      'core/boyz.md',
      'orks/faction.md',
      'orks/rules.md',
    ]);
  });

  it('reads the muster rules from the core folder, and reports a second one', () => {
    const lib = Library.fromFiles([
      { path: 'core/a.md', source: muster },
      { path: 'core/b.md', source: muster },
    ]);

    expect(lib.muster?.id).toBe('a');
    expect(lib.errors).toEqual([{ path: 'core/b.md', errors: ['only one muster record is used'] }]);
  });

  it('finds units and detachments by id, and nothing for unknown ids', () => {
    const lib = Library.fromFiles([
      { path: 'orks/faction.md', source: faction('Orks') },
      { path: 'orks/boyz.md', source: unit('Boyz') },
      { path: 'orks/waaagh.md', source: detachment('Waaagh') },
    ]);

    expect(lib.unit('orks', 'boyz')).toMatchObject({ faction: { id: 'orks' }, unit: { name: 'Boyz' } });
    expect(lib.unit('orks', 'nobz')).toBeUndefined();
    expect(lib.unit('tau', 'boyz')).toBeUndefined();
    expect(lib.detachment('orks', 'waaagh')?.detachment.name).toBe('Waaagh');
    expect(lib.detachment('orks', 'boyz')).toBeUndefined();
  });

  it('no files gives an empty library', () => {
    expect(Library.fromFiles([])).toMatchObject({ factions: [], errors: [], muster: undefined });
  });
});

describe('demo content', () => {
  const lib = Library.fromFiles(loadDemoFiles());

  it('every file is valid and in its place', () => {
    expect(lib.errors).toEqual([]);
  });

  it('has the muster rules and a faction with units and detachments', () => {
    expect(lib.muster).toBeDefined();

    expect(lib.factions.map((f) => [f.id, f.units.length > 0, f.detachments.length > 0])).toEqual([
      ['demo-host', true, true],
    ]);
  });
});
