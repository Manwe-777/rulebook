import 'fake-indexeddb/auto';

import { describe, expect, it } from 'vitest';

import { ReleaseCache } from './ReleaseCache';

const FILES = [{ path: 'demo/unit.md', source: '---\nkind: unit\n---' }];

describe('ReleaseCache', () => {
  it('gives back what was saved, with when it was saved, across instances', async () => {
    await new ReleaseCache('owner-a').write(FILES, 1234);

    expect(await new ReleaseCache('owner-a').read()).toEqual({ files: FILES, savedAt: 1234 });
  });

  it('keeps each owner’s releases apart', async () => {
    await new ReleaseCache('owner-a').write(FILES);

    expect(await new ReleaseCache('owner-b').read()).toBeNull();
  });

  it('has nothing after clearing', async () => {
    const cache = new ReleaseCache('owner-a');

    await cache.write(FILES);
    await cache.clear();

    expect(await cache.read()).toBeNull();
  });
});
