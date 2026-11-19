import { describe, expect, it } from 'vitest';

import { mergeFiles } from './mergeFiles';

const file = (path: string) => ({ path, source: path });

describe('mergeFiles', () => {
  it('keeps bundled factions the relays do not have, and adds the relay ones', () => {
    const merged = mergeFiles([file('content/demo/faction.md')], [file('orks/faction.md'), file('orks/boyz.md')]);

    expect(merged.map((f) => f.path)).toEqual(['content/demo/faction.md', 'orks/faction.md', 'orks/boyz.md']);
  });

  it('a faction or core found on the relays replaces every bundled file of it', () => {
    const bundled = [file('content/demo/faction.md'), file('content/demo/old.md'), file('content/core/muster.md')];
    const remote = [file('demo/faction.md'), file('core/muster.md')];

    expect(mergeFiles(bundled, remote).map((f) => f.path)).toEqual(['demo/faction.md', 'core/muster.md']);
  });

  it('no relay files leaves the bundled ones as they are', () => {
    expect(mergeFiles([file('content/demo/faction.md')], [])).toEqual([file('content/demo/faction.md')]);
  });
});
