import { describe, expect, it } from 'vitest';

import { checkDataset } from '../dataset/checkDataset';
import { demoList } from '../testing/demoList';
import { loadDemoFiles } from '../testing/loadDemoFiles';
import { validateList } from '../validate/validateList';
import { Library } from './Library';

const CHAPTER = `---
kind: faction
name: Demo Chapter
factionKeyword: DEMO HOST
includes: [demo-host]
excludes: [marshal-venn]
---
`;

const GUARD = `---
kind: unit
name: Chapter Guard
profiles:
  - { name: Guard, M: 6", T: 4, Sv: 3+, W: 2, Ld: 6+, OC: 1 }
melee:
  - { name: Halberd, A: 3, WS: 3+, S: 5, AP: -2, D: 1 }
composition:
  models: [{ name: Guard, min: 5, max: 5 }]
  points: [{ models: 5, points: 100 }]
  wargear: { Guard: [halberd] }
keywords: [INFANTRY, CHAPTER GUARD]
factionKeywords: [DEMO HOST]
---
`;

/** The demo files, with the shared Field Captain also able to lead a chapter's own unit, plus that chapter. */
function files(chapter = CHAPTER) {
  const demo = loadDemoFiles().map((f) =>
    f.path.endsWith('field-captain.md')
      ? {
          ...f,
          source: f.source.replace('[line-troopers, veteran-squad]', '[line-troopers, veteran-squad, chapter-guard]'),
        }
      : f,
  );

  return [
    ...demo,
    { path: 'content/demo-chapter/faction.md', source: chapter },
    { path: 'content/demo-chapter/chapter-guard.md', source: GUARD },
  ];
}

const library = Library.fromFiles(files());

describe('factions that include another', () => {
  it("an army can take the included faction's datasheets and detachments, except the excluded ones", () => {
    const units = library.armyUnits('demo-chapter').map((u) => u.id);

    expect(units).toContain('chapter-guard');
    expect(units).toContain('field-captain');
    expect(units).not.toContain('marshal-venn');
    expect(library.armyDetachments('demo-chapter').map((d) => d.id)).toContain('shield-wall');
  });

  it('a shared datasheet is found through the chapter, with the faction it belongs to', () => {
    expect(library.unit('demo-chapter', 'field-captain')?.faction.id).toBe('demo-host');
    expect(library.unit('demo-chapter', 'marshal-venn')).toBeUndefined();
    expect(library.unit('demo-host', 'chapter-guard')).toBeUndefined();
  });

  it('a chapter list with shared units, a shared detachment and a shared leader on its own unit is legal', () => {
    const list = demoList({
      faction: 'demo-chapter',
      units: [
        { id: 'captain', unit: 'field-captain', models: 1, enhancement: 'banner-of-resolve', attachedTo: 'guard' },
        { id: 'guard', unit: 'chapter-guard', models: 5 },
      ],
    });

    expect(validateList(list, library)).toEqual([]);
  });

  it('an excluded datasheet is not part of the chapter', () => {
    const list = demoList({ faction: 'demo-chapter', units: [{ id: 'm', unit: 'marshal-venn', models: 1 }] });

    expect(validateList(list, library).map((i) => i.code)).toContain('unknown-unit');
  });

  it("a shared leader may name a unit of a faction that includes it; the parent's own checks accept that", () => {
    expect(checkDataset(library).filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('including a faction that does not exist is reported', () => {
    const broken = Library.fromFiles(files(CHAPTER.replace('includes: [demo-host]', 'includes: [nobody]')));

    expect(checkDataset(broken).map((i) => i.code)).toContain('unknown-include');
  });
});
