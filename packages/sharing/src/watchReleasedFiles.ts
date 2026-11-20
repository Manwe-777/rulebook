import type { ReleasedRules } from './schemas';
import { mergeReleasedRules } from './utils/mergeReleasedRules';

/** Where the released rules shown come from. */
export type ReleaseSource = 'loading' | 'cached' | 'offline' | 'relays' | 'failed';

interface Options {
  /** Reads the newest releases from the relays. */
  load: () => Promise<ReleasedRules>;
  cache: {
    read: () => Promise<{ rules: ReleasedRules; savedAt: number } | null>;
    write: (rules: ReleasedRules, now: number) => Promise<void>;
  };
  /** `checkedAt`: when the relays gave these rules (now, or when the cached copy was saved); null with none. */
  onChange: (rules: ReleasedRules | null, source: ReleaseSource, checkedAt: number | null) => void;
  now?: () => number;
}

/**
 * Shows the cached releases first (`cached`), then the relays' merged into them (`relays`), saving them for next time:
 * a faction the relays didn't return keeps its cached release. When the relays
 * can't be reached the cached copy stays (`offline`), or there is nothing (`failed`). Returns a function that stops
 * further updates.
 */
export function watchReleasedFiles({ load, cache, onChange, now = Date.now }: Options): () => void {
  let stopped = false;
  let shown = false;
  const report: Options['onChange'] = (...args) => !stopped && onChange(...args);

  const cached = cache.read().then((saved) => {
    // The relays may already have answered; never replace newer rules with the cache.
    if (saved && !shown) {
      shown = true;
      report(saved.rules, 'cached', saved.savedAt);
    }

    return saved;
  });

  load()
    .then(async (fresh) => {
      // What the relays gave is merged into the saved copy, so factions missing from a partial answer stay.
      const saved = await cached.catch(() => null);
      const rules = saved ? mergeReleasedRules(saved.rules, fresh) : fresh;
      const at = now();

      shown = true;
      report(rules, 'relays', at);
      await cache.write(rules, at);
    })
    .catch(async () => {
      const saved = await cached;

      report(saved?.rules ?? null, saved ? 'offline' : 'failed', saved?.savedAt ?? null);
    });

  return () => {
    stopped = true;
  };
}
