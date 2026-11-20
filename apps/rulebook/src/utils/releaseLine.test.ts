import { describe, expect, it } from 'vitest';

import { releaseLine } from './releaseLine';

const now = Date.UTC(2026, 10, 20, 12);

const release = {
  faction: 'orks',
  version: '2026-11',
  date: '2026-11-20T10:00:00Z',
  hash: 'h',
  notes: '',
  records: 71,
};

describe('releaseLine', () => {
  it('gives the version, how long ago it was released and how many records it holds', () => {
    expect(releaseLine(release, now)).toBe('2026-11 · released 2 h ago · 71 records');
    expect(releaseLine({ ...release, records: 1 }, now)).toMatch(/1 record$/);
  });

  it('says a faction with no release is the built-in demo', () => {
    expect(releaseLine(undefined, now)).toBe('Built-in demo');
  });
});
