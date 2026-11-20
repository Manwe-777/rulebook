import { Library } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';
import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../sources/loadBundledFiles';
import { rulesRows } from './rulesRows';

const library = Library.fromFiles(loadBundledFiles());

const release = (faction: string, date: string): ReleaseInfo => ({
  faction,
  date,
  version: 'v',
  hash: 'h',
  notes: '',
  records: 1,
});

describe('rulesRows', () => {
  it('lists the most recently released first', () => {
    const rows = rulesRows(library, [
      release('demo-host', '2026-11-01T00:00:00Z'),
      release('core', '2026-11-20T00:00:00Z'),
    ]);

    expect(rows.map((r) => r.id)).toEqual(['core', 'demo-host']);
  });

  it('puts rules with no release (built in) after released ones', () => {
    expect(rulesRows(library, [release('core', '2026-11-20T00:00:00Z')]).map((r) => r.id)).toEqual([
      'core',
      'demo-host',
    ]);

    expect(rulesRows(library, [release('demo-host', '2026-11-20T00:00:00Z')]).map((r) => r.id)).toEqual([
      'demo-host',
      'core',
    ]);
  });
});
