import { describe, expect, it } from 'vitest';

import { Library } from '../library/Library';
import { loadDemoFiles } from '../testing/loadDemoFiles';
import { detachmentTags } from './detachmentTags';
import { keywordKey } from './keywordKey';
import { recordPath } from './recordPath';
import { slugify } from './slugify';

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

  it('gives the cost in detachment points, the disposition by name and the unique tags', () => {
    expect(detachmentTags(detachment('shield-wall'), library.muster)).toEqual(['2 DP', 'Take and Hold', 'VANGUARD']);
    expect(detachmentTags(detachment('armoured-column'), library.muster)).toEqual(['1 DP', 'Disruption']);
  });

  it('falls back to the disposition id when the muster rules are not loaded', () => {
    expect(detachmentTags(detachment('armoured-column'), undefined)).toEqual(['1 DP', 'disruption']);
  });
});
