import { describe, expect, it, vi } from 'vitest';

import type { ReleasedRules } from './schemas';
import { type ReleaseSource, watchReleasedFiles } from './watchReleasedFiles';

const OLD: ReleasedRules = { files: [{ path: 'demo/a.md', source: 'old' }], releases: [] };
const NEW: ReleasedRules = { files: [{ path: 'demo/a.md', source: 'new' }], releases: [] };
const SAVED_AT = 100;
const NOW = 500;

/** A promise and the functions that settle it, to decide the order things arrive in. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => ((resolve = res), (reject = rej)));

  return { promise, resolve, reject };
}

function setup(saved: ReleasedRules | null) {
  const relays = deferred<ReleasedRules>();
  const cacheRead = deferred<{ rules: ReleasedRules; savedAt: number } | null>();
  const write = vi.fn(async () => undefined);
  const seen: [ReleasedRules | null, ReleaseSource, number | null][] = [];

  const stop = watchReleasedFiles({
    load: () => relays.promise,
    cache: { read: () => cacheRead.promise, write },
    onChange: (rules, source, checkedAt) => seen.push([rules, source, checkedAt]),
    now: () => NOW,
  });

  return {
    relays,
    cacheRead: () => cacheRead.resolve(saved ? { rules: saved, savedAt: SAVED_AT } : null),
    write,
    seen,
    stop,
  };
}

const settle = () => new Promise((r) => setTimeout(r, 0));

describe('watchReleasedFiles', () => {
  it('shows the cached rules first (checked when saved), then the relays’ (checked now) and saves those', async () => {
    const t = setup(OLD);

    t.cacheRead();
    await settle();
    t.relays.resolve(NEW);
    await settle();

    expect(t.seen).toEqual([
      [OLD, 'cached', SAVED_AT],
      [NEW, 'relays', NOW],
    ]);

    expect(t.write).toHaveBeenCalledWith(NEW, NOW);
  });

  it('the relays’ rules come last even when the cached copy arrives late, so they are never replaced by it', async () => {
    const t = setup(OLD);

    t.relays.resolve(NEW);
    await settle();
    t.cacheRead();
    await settle();

    expect(t.seen.at(-1)).toEqual([NEW, 'relays', NOW]);
    expect(t.seen.filter(([, source]) => source === 'relays')).toHaveLength(1);
  });

  it('a faction the relays leave out this time stays from the cache, and stays saved', async () => {
    const both: ReleasedRules = {
      files: [
        { path: 'demo/a.md', source: 'old' },
        { path: 'orks/faction.md', source: 'orks' },
      ],
      releases: [],
    };

    const t = setup(both);

    t.cacheRead();
    t.relays.resolve(NEW);
    await settle();

    const [shown] = t.seen.at(-1)!;

    expect(shown?.files.map((f) => f.source).sort()).toEqual(['new', 'orks']);
    expect(t.write).toHaveBeenCalledWith(shown, NOW);
  });

  it('keeps the cached rules when the relays are unreachable', async () => {
    const t = setup(OLD);

    t.cacheRead();
    t.relays.reject(new Error('down'));
    await settle();

    expect(t.seen.at(-1)).toEqual([OLD, 'offline', SAVED_AT]);
    expect(t.write).not.toHaveBeenCalled();
  });

  it('fails with nothing cached and no relay', async () => {
    const t = setup(null);

    t.cacheRead();
    t.relays.reject(new Error('down'));
    await settle();

    expect(t.seen).toEqual([[null, 'failed', null]]);
  });

  it('reports nothing after being stopped', async () => {
    const t = setup(OLD);

    t.stop();
    t.cacheRead();
    t.relays.resolve(NEW);
    await settle();

    expect(t.seen).toEqual([]);
  });
});
