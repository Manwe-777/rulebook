import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { Library } from '../library/Library';
import { constraintSchema } from '../schemas/constraintSchema';
import { demoList } from '../testing/demoList';
import { loadDemoFiles } from '../testing/loadDemoFiles';
import { validateList } from './validateList';

const captain = readFileSync(join(import.meta.dirname, '../../content/demo-host/field-captain.md'), 'utf8');

/** The demo library plus a second faction, "Allies", with the same faction keyword and one Allied Scout datasheet. */
function libraryWithAllies(constraints: unknown[] = []): Library {
  const library = Library.fromFiles([
    ...loadDemoFiles(),
    {
      path: 'content/allies/faction.md',
      source: "---\nkind: faction\nname: Allies\ncolor: '#123456'\nfactionKeyword: DEMO HOST\n---\n",
    },
    { path: 'content/allies/allied-scout.md', source: captain.replace('name: Field Captain', 'name: Allied Scout') },
  ]);

  const muster = { ...library.muster!, constraints: constraints.map((c) => constraintSchema.parse(c)) };

  return Object.assign(Object.create(Library.prototype), library, { muster });
}

const scouts = (count: number) =>
  demoList({
    units: [
      ...demoList().units,
      ...Array.from({ length: count }, (_, i) => ({ id: `scout${i}`, unit: 'allies/allied-scout', models: 1 })),
    ],
  });

const errors = (list: ReturnType<typeof demoList>, library: Library) =>
  validateList(list, library)
    .filter((i) => i.severity === 'error')
    .map((i) => i.code);

describe('checkFaction', () => {
  it("a unit from a faction the army doesn't include can't join, even with the right faction keyword", () => {
    const issues = validateList(scouts(1), libraryWithAllies()).filter((i) => i.code === 'wrong-faction');

    expect(issues.map((i) => i.entries)).toEqual([['scout0']]);
    expect(issues[0].message).toBe("Allied Scout can't join a Demo Host army.");
  });

  it('an allow constraint lets allies in up to its points limit, and none at all past it', () => {
    const allies = libraryWithAllies([
      {
        id: 'allies',
        allow: 'faction',
        select: { units: { ids: ['allied-scout'] } },
        measure: 'points',
        max: 140,
        message: 'Up to 140 points of allies.',
      },
    ]);

    expect(errors(scouts(2), allies)).toEqual([]);
    expect(errors(scouts(3), allies).sort()).toEqual(['allies', 'wrong-faction', 'wrong-faction', 'wrong-faction']);
  });
});
