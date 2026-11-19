import type { RulesFile } from '@rulebook/rules';

/** Where the released rules shown come from. */
export type ReleaseSource = 'loading' | 'cached' | 'offline' | 'relays' | 'failed';

interface Options {
  /** Reads the newest releases from the relays. */
  load: () => Promise<RulesFile[]>;
  cache: { read: () => Promise<{ files: RulesFile[] } | null>; write: (files: RulesFile[]) => Promise<void> };
  onChange: (files: RulesFile[] | null, source: ReleaseSource) => void;
}

/**
 * Shows the cached releases first (`cached`), then the relays' (`relays`), saving them for next time. When the relays
 * can't be reached the cached copy stays (`offline`), or there is nothing (`failed`). Returns a function that stops
 * further updates.
 */
export function watchReleasedFiles({ load, cache, onChange }: Options): () => void {
  let stopped = false;
  let shown = false;
  const report: Options['onChange'] = (files, source) => !stopped && onChange(files, source);

  const cached = cache.read().then((saved) => {
    // The relays may already have answered; never replace newer files with the cache.
    if (saved && !shown) {
      shown = true;
      report(saved.files, 'cached');
    }

    return saved;
  });

  load()
    .then(async (files) => {
      shown = true;
      report(files, 'relays');
      await cache.write(files);
    })
    .catch(async () => {
      const saved = await cached;

      report(saved?.files ?? null, saved ? 'offline' : 'failed');
    });

  return () => {
    stopped = true;
  };
}
