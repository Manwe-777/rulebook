import 'fake-indexeddb/auto';

import { createStore, set } from 'idb-keyval';
import { describe, expect, it } from 'vitest';

import { CACHE_DB } from '../constants';
import type { ReleasedRules } from '../schemas';
import { ReleaseCache } from './ReleaseCache';

const RULES: ReleasedRules = {
  files: [{ path: 'demo/unit.md', source: '---\nkind: unit\n---' }],
  releases: [{ faction: 'demo', version: '2026-11', date: '2026-11-19T10:00:00Z', hash: 'h', notes: '', records: 1 }],
};

describe('ReleaseCache', () => {
  it('gives back the files and release info saved, with when they were saved, across instances', async () => {
    await new ReleaseCache('owner-a').write(RULES, 1234);

    expect(await new ReleaseCache('owner-a').read()).toEqual({ rules: RULES, savedAt: 1234 });
  });

  it('keeps each owner’s releases apart', async () => {
    await new ReleaseCache('owner-c').write(RULES);

    expect(await new ReleaseCache('owner-d').read()).toBeNull();
  });

  it('a copy saved before release info was kept still gives its files', async () => {
    await set('released-files:owner-old', { files: RULES.files, savedAt: 5 }, createStore(CACHE_DB, 'releases'));

    expect(await new ReleaseCache('owner-old').read()).toEqual({
      rules: { files: RULES.files, releases: [] },
      savedAt: 5,
    });
  });

  it('has nothing after clearing', async () => {
    const cache = new ReleaseCache('owner-e');

    await cache.write(RULES);
    await cache.clear();

    expect(await cache.read()).toBeNull();
  });
});
