import { Library } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from './loadBundledFiles';

describe('bundled content', () => {
  it('loads every demo file with no errors', () => {
    const library = Library.fromFiles(loadBundledFiles());

    expect(library.errors).toEqual([]);
    expect(library.factions.length).toBeGreaterThan(0);
    expect(library.muster).toBeDefined();
  });
});
