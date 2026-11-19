import type { RulesFile } from '@rulebook/rules';
import { describe, expect, it, vi } from 'vitest';

import { type ReleaseSource, watchReleasedFiles } from './watchReleasedFiles';

const OLD: RulesFile[] = [{ path: 'demo/a.md', source: 'old' }];
const NEW: RulesFile[] = [{ path: 'demo/a.md', source: 'new' }];

/** A promise and the functions that settle it, to decide the order things arrive in. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => ((resolve = res), (reject = rej)));

  return { promise, resolve, reject };
}

function setup(saved: RulesFile[] | null) {
  const relays = deferred<RulesFile[]>();
  const cacheRead = deferred<{ files: RulesFile[] } | null>();
  const write = vi.fn(async () => undefined);
  const seen: [RulesFile[] | null, ReleaseSource][] = [];

  const stop = watchReleasedFiles({
    load: () => relays.promise,
    cache: { read: () => cacheRead.promise, write },
    onChange: (files, source) => seen.push([files, source]),
  });

  return { relays, cacheRead: () => cacheRead.resolve(saved ? { files: saved } : null), write, seen, stop };
}

const settle = () => new Promise((r) => setTimeout(r, 0));

describe('watchReleasedFiles', () => {
  it('shows the cached rules first, then the relays’ and saves those for next time', async () => {
    const t = setup(OLD);

    t.cacheRead();
    await settle();
    t.relays.resolve(NEW);
    await settle();

    expect(t.seen).toEqual([
      [OLD, 'cached'],
      [NEW, 'relays'],
    ]);

    expect(t.write).toHaveBeenCalledWith(NEW);
  });

  it('never replaces the relays’ rules with an older cached copy that arrives late', async () => {
    const t = setup(OLD);

    t.relays.resolve(NEW);
    await settle();
    t.cacheRead();
    await settle();

    expect(t.seen).toEqual([[NEW, 'relays']]);
  });

  it('keeps the cached rules when the relays are unreachable', async () => {
    const t = setup(OLD);

    t.cacheRead();
    t.relays.reject(new Error('down'));
    await settle();

    expect(t.seen.at(-1)).toEqual([OLD, 'offline']);
    expect(t.write).not.toHaveBeenCalled();
  });

  it('fails with nothing cached and no relay', async () => {
    const t = setup(null);

    t.cacheRead();
    t.relays.reject(new Error('down'));
    await settle();

    expect(t.seen).toEqual([[null, 'failed']]);
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
