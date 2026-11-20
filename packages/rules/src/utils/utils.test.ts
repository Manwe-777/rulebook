import { describe, expect, it } from 'vitest';

import { Library } from '../library/Library';
import { loadDemoFiles } from '../testing/loadDemoFiles';
import { detachmentTags } from './detachmentTags';
import { glossaryKey } from './glossaryKey';
import { keywordKey } from './keywordKey';
import { recordPath } from './recordPath';
import { slugify } from './slugify';
import { tally } from './tally';
import { wargearName } from './wargearName';

describe('recordPath', () => {
  it('takes the bundle and file name from a path inside content/', () => {
    expect(recordPath('/content/orks/boyz.md')).toEqual({ bundle: 'orks', name: 'boyz' });
    expect(recordPath('rulebook/content/orks/Boyz.MD')).toEqual({ bundle: 'orks', name: 'Boyz' });
  });

  it('accepts a bare <bundle>/<file>.md path, as uploads and other sources give', () => {
    expect(recordPath('orks/boyz.md')).toEqual({ bundle: 'orks', name: 'boyz' });
    expect(recordPath('orks\\boyz.md')).toEqual({ bundle: 'orks', name: 'boyz' });
  });

  it('rejects files that are not exactly one folder deep or not Markdown', () => {
    expect(recordPath('content/boyz.md')).toBeNull();
    expect(recordPath('content/orks/extra/boyz.md')).toBeNull();
    expect(recordPath('content/orks/boyz.txt')).toBeNull();
  });
});

describe('slugify', () => {
  it('lowercases, drops accents and apostrophes, and joins words with hyphens', () => {
    expect(slugify("Kâhl's Hammer")).toBe('kahls-hammer');
    expect(slugify('  Brace! ')).toBe('brace');
    expect(slugify('Plasma pistol – supercharge')).toBe('plasma-pistol-supercharge');
  });
});

describe('keywordKey', () => {
  it('matches keywords whatever their case, accents or spacing', () => {
    expect(keywordKey('Kâhl')).toBe(keywordKey('KAHL'));
    expect(keywordKey(' epic  hero ')).toBe('EPIC HERO');
  });
});

describe('detachmentTags', () => {
  const library = Library.fromFiles(loadDemoFiles());
  const detachment = (id: string) => library.detachment('demo-host', id)!.detachment;

  it('gives the cost in detachment points, every disposition by name and the unique tags', () => {
    expect(detachmentTags(detachment('shield-wall'), library.muster)).toEqual(['2 DP', 'Take and Hold', 'VANGUARD']);

    expect(detachmentTags(detachment('armoured-column'), library.muster)).toEqual([
      '1 DP',
      'Disruption',
      'Purge the Foe',
    ]);
  });

  it('falls back to the disposition id when the muster rules are not loaded', () => {
    expect(detachmentTags(detachment('shield-wall'), undefined)).toEqual(['2 DP', 'take-and-hold', 'VANGUARD']);
  });
});

describe('wargearName', () => {
  const library = Library.fromFiles(loadDemoFiles());
  const unit = (id: string) => library.unit('demo-host', id)!.unit;

  it('names weapons by their group, equipment by its name, and unknown ids by the id itself', () => {
    expect(wargearName(unit('marshal-venn'), 'marshals-blade')).toBe("Marshal's blade");
    expect(wargearName(unit('line-troopers'), 'signal-flare')).toBe('Signal flare');
    expect(wargearName(unit('marshal-venn'), 'lance')).toBe('lance');
  });
});

describe('tally', () => {
  it('counts each id once, in order of first appearance', () => {
    expect(tally(['a', 'b', 'a'])).toEqual([
      { id: 'a', count: 2 },
      { id: 'b', count: 1 },
    ]);

    expect(tally([])).toEqual([]);
  });
});

describe('glossaryKey and Library.explain', () => {
  it('finds a term whatever value a weapon or ability gives it', () => {
    expect(glossaryKey('SUSTAINED HITS 2')).toBe(glossaryKey('Sustained Hits X'));
    expect(glossaryKey('RAPID FIRE 3')).toBe('RAPID FIRE');
    expect(glossaryKey('Feel No Pain 4+')).toBe(glossaryKey('Feel No Pain X+'));
    expect(glossaryKey('Deadly Demise D6')).toBe('DEADLY DEMISE');
    expect(glossaryKey('Scouts 9"')).toBe('SCOUTS');
    expect(glossaryKey('SUSTAINED HITS D3')).toBe('SUSTAINED HITS');
    expect(glossaryKey('ANTI-VEHICLE 3+')).toBe(glossaryKey('Anti-keyword X+'));
    expect(glossaryKey('[LETHAL HITS]')).toBe('LETHAL HITS');
    expect(glossaryKey('SUSTAINED HITS 1: NON-MONSTER/VEHICLE')).toBe('SUSTAINED HITS');
    expect(glossaryKey('LETHAL HITS: MONSTER/VEHICLE')).toBe('LETHAL HITS');
  });

  it('the library explains terms from the core glossary, and nothing it does not know', () => {
    const library = Library.fromFiles(loadDemoFiles());

    expect(library.explain('ANTI-INFANTRY 4+')?.term).toBe('Anti-keyword X+');
    expect(library.explain('Twin-linked')?.text).toContain('Re-roll');
    expect(library.explain('Made-up rule')).toBeUndefined();
  });
});
