import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { Detachment, Muster, RulesRecord, Unit } from '../types';
import { parseRecord } from './parseRecord';
import { recordKind } from './recordKind';

const CONTENT = join(import.meta.dirname, '../../content');

const UNIT = `---
kind: unit
name: Scouts
profiles: [{ name: Scout, M: 7", T: 3, Sv: 5+, W: 1, Ld: 7+, OC: 1 }]
composition:
  models: [{ name: Scout, min: 5, max: 10 }]
  points: [{ models: 5, points: 60 }, { models: 10, points: 120 }]
keywords: [Infantry]
factionKeywords: [Demo Host]
---
`;

const DETACHMENT = `---
kind: detachment
name: Night Raid
enhancements: [{ name: Silent Boots, points: 10 }]
stratagems: [{ name: Vanish, cp: 1 }]
---

## Enhancements

### Silent Boots

Text for the boots.

## Stratagems

### Vanish

Text for vanish.
`;

function parse(source: string): RulesRecord {
  const result = parseRecord(source, 'demo/x.md', 'x');

  if (!result.ok) throw new Error(result.errors.join('\n'));

  return result.value;
}

function errorsOf(source: string): string[] {
  const result = parseRecord(source, 'demo/x.md', 'x');

  return result.ok ? [] : result.errors;
}

const demo = (file: string) => readFileSync(join(CONTENT, file), 'utf8');

describe('parseRecord: units', () => {
  it('reads a demo unit with weapons, options and a leader section', () => {
    const unit = parse(demo('demo-host/field-captain.md')) as Unit;

    expect(unit).toMatchObject({ kind: 'unit', id: 'x', roles: ['character'] });
    expect(unit.ranged.map((w) => w.id)).toEqual(['service-pistol', 'grenade-launcher']);
    expect(unit.leader?.bodyguards).toEqual(['line-troopers', 'veteran-squad']);
    expect(unit.wargearOptions[0]).toMatchObject({ per: 'all', points: 0, with: [['grenade-launcher']] });
  });

  it('profiles of one weapon share the id of their group', () => {
    const unit = parse(demo('demo-host/marshal-venn.md')) as Unit;

    expect(unit.melee.map((w) => w.id)).toEqual(['marshals-blade', 'marshals-blade']);
  });

  it('numbers and text stats both come out as text, keeping negative AP', () => {
    const unit = parse(
      UNIT.replace('composition', 'melee: [{ name: Claw, A: D6, WS: 4+, S: 3, AP: -1, D: 1 }]\ncomposition'),
    ) as Unit;

    expect(unit.melee[0]).toMatchObject({ A: 'D6', AP: '-1', id: 'claw' });
  });

  it('optional lists default to empty and the id comes from the file name', () => {
    expect(parse(UNIT)).toMatchObject({ id: 'x', ranged: [], melee: [], roles: [], wargearOptions: [] });
  });

  it('an id in the frontmatter wins over the file name', () => {
    expect(parse(UNIT.replace('name: Scouts', 'id: scout-squad\nname: Scouts')).id).toBe('scout-squad');
  });

  it('names every missing or wrong field, not just the first one', () => {
    const errors = errorsOf(UNIT.replace('name: Scouts\n', '').replace('keywords: [Infantry]', 'keywords: []'));

    expect(errors.some((e) => e.startsWith('name:'))).toBe(true);
    expect(errors.some((e) => e.startsWith('keywords:'))).toBe(true);
  });

  it('points at the exact weapon field that is missing', () => {
    const errors = errorsOf(
      UNIT.replace('composition', 'ranged: [{ name: Gun, range: 12", A: 1, S: 3, AP: 0, D: 1 }]\ncomposition'),
    );

    expect(errors).toEqual([expect.stringMatching(/^ranged\.0\.BS:/)]);
  });

  it('rejects a misspelled field instead of silently ignoring it', () => {
    expect(errorsOf(UNIT.replace('keywords:', 'keywrods: [X]\nkeywords:'))).toHaveLength(1);
  });

  it('rejects an unknown role', () => {
    expect(errorsOf(UNIT.replace('name: Scouts', 'name: Scouts\nroles: [hero]'))[0]).toMatch(/^roles\.0:/);
  });

  it('rejects a misspelled section heading', () => {
    expect(errorsOf(UNIT + '## Abilites\nx')).toEqual(['unknown section "## Abilites"']);
  });

  it('reports broken YAML instead of throwing', () => {
    expect(errorsOf('---\nname: [unclosed\n---\n')[0]).toMatch(/not valid YAML/);
  });

  it('reports a file with no frontmatter, or one without a known kind', () => {
    expect(errorsOf('# Scouts')).toContain('missing the "---" frontmatter block at the top');
    expect(errorsOf('---\nname: Scouts\n---\n')[0]).toMatch(/kind/);
    expect(errorsOf('---\nkind: army\nname: Scouts\n---\n')[0]).toMatch(/kind/);
  });

  it('rejects an image that is not a URL', () => {
    expect(errorsOf(UNIT.replace('name: Scouts', 'name: Scouts\nimage: scout.png'))[0]).toMatch(/^image:/);
  });
});

describe('parseRecord: detachments', () => {
  it('gives each enhancement and stratagem the text under its heading', () => {
    const detachment = parse(DETACHMENT) as Detachment;

    expect(detachment.enhancements).toEqual([
      expect.objectContaining({ id: 'silent-boots', target: 'model', text: 'Text for the boots.' }),
    ]);

    expect(detachment.stratagems).toEqual([expect.objectContaining({ id: 'vanish', cp: 1, text: 'Text for vanish.' })]);
    expect(detachment).toMatchObject({ cost: 1, unique: [], constraints: [] });
  });

  it('matches headings to entries ignoring case and punctuation', () => {
    const detachment = parse(DETACHMENT.replace('### Vanish', '### VANISH!')) as Detachment;

    expect(detachment.stratagems[0].text).toBe('Text for vanish.');
  });

  it('an entry without text is kept, with no text', () => {
    const detachment = parse(DETACHMENT.replace('### Silent Boots\n\nText for the boots.\n', '')) as Detachment;

    expect(detachment.enhancements[0].text).toBeUndefined();
  });

  it('reports a heading that matches no entry', () => {
    expect(errorsOf(DETACHMENT.replace('### Vanish', '### Disappear'))).toEqual([
      expect.stringMatching(/### Disappear in Stratagems/),
    ]);
  });

  it('reads every demo detachment, including one with a constraint', () => {
    const detachment = parse(demo('demo-host/rapid-response.md')) as Detachment;

    expect(detachment.constraints[0]).toMatchObject({ id: 'needs-deep-strikers', measure: 'count', min: 1 });
  });

  it('rejects a constraint without a comparison', () => {
    const source = DETACHMENT.replace(
      'stratagems:',
      'constraints: [{ id: c, select: { units: { roles: [battleline] } }, message: M }]\nstratagems:',
    );

    expect(errorsOf(source)[0]).toMatch(/needs a comparison/);
  });
});

describe('parseRecord: muster and faction', () => {
  it('reads the demo muster rules, filling in defaults', () => {
    const muster = parse(demo('core/muster.md')) as Muster;

    expect(muster.id).toBe('matched-play');
    expect(muster.battleSizes.map((b) => b.points)).toEqual([1000, 2000]);
    expect(muster.battleSizes[1].overrides).toEqual({});
    expect(muster.attachments).toEqual({ leadersPerBodyguard: 1, supportPerBodyguard: 1 });
  });

  it('a faction keeps its body as Markdown', () => {
    const faction = parse(demo('demo-host/faction.md'));

    expect(faction).toMatchObject({ kind: 'faction', factionKeyword: 'DEMO HOST' });
    expect('body' in faction && faction.body.startsWith('## Description')).toBe(true);
  });
});

describe('recordKind', () => {
  it('reads the declared kind, even with fields or kinds this version does not know', () => {
    expect(recordKind('---\nkind: unit\nname: X\n---\nText')).toBe('unit');
    expect(recordKind('---\nkind: battle-plan\nnewField: [1, 2]\n---\n')).toBe('battle-plan');
  });

  it('anything that does not declare a kind is not a record', () => {
    expect(recordKind('not a record')).toBeNull();
    expect(recordKind('---\nname: X\n---\n')).toBeNull();
    expect(recordKind('---\nkind: [unit\n---\n')).toBeNull();
    expect(recordKind('---\nkind: Unit Record\n---\n')).toBeNull();
  });
});
