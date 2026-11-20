import type { ReleasedRules } from './schemas';
import { mergeReleasedRules } from './utils/mergeReleasedRules';

/** Where the released rules shown come from. */
export type ReleaseSource = 'loading' | 'cached' | 'offline' | 'relays' | 'failed';

/** How often rules arriving one faction at a time are saved, at most, in milliseconds. */
const SAVE_EVERY_MS = 3000;

interface Options {
  /**
   * Reads the newest releases from the relays. `have` is what is saved already (its releases aren't downloaded
   * again); `onProgress` gets each faction as it arrives.
   */
  load: (have: ReleasedRules | null, onProgress: (rules: ReleasedRules) => void) => Promise<ReleasedRules>;
  cache: {
    read: () => Promise<{ rules: ReleasedRules; savedAt: number } | null>;
    write: (rules: ReleasedRules, now: number) => Promise<void>;
  };
  /** `checkedAt`: when the relays gave these rules (now, or when the cached copy was saved); null with none. */
  onChange: (rules: ReleasedRules | null, source: ReleaseSource, checkedAt: number | null) => void;
  now?: () => number;
}

/**
 * Shows the cached releases first (`cached`), then checks the relays: only releases that changed are downloaded, and
 * each faction is shown and saved as it arrives, so an interrupted load keeps what it got. Once every faction is read
 * the rules are `relays`; a faction the relays didn't return keeps its cached release. When the relays can't be
 * reached the cached copy stays (`offline`), or there is nothing (`failed`). Returns a function that stops updates.
 */
/** The rules shown so far, merged as they arrive, and when they were last saved. */
class Shown {
  rules: ReleasedRules | null;
  savedAt: number | null;
  /** Whether rules from the relays arrived during this load. */
  arrived = false;
  private lastSave = -Infinity;

  constructor(
    saved: { rules: ReleasedRules; savedAt: number } | null,
    private readonly cache: Options['cache'],
  ) {
    this.rules = saved?.rules ?? null;
    this.savedAt = saved?.savedAt ?? null;
  }

  add(rules: ReleasedRules): ReleasedRules {
    this.arrived = true;
    this.rules = this.rules ? mergeReleasedRules(this.rules, rules) : rules;

    return this.rules;
  }

  /** Saves the rules shown, unless they were saved less than `SAVE_EVERY_MS` ago (or `force`). */
  save(at: number, force = false): Promise<void> {
    if (!this.rules || (!force && at - this.lastSave < SAVE_EVERY_MS)) return Promise.resolve();

    this.lastSave = at;
    this.savedAt = at;

    return this.cache.write(this.rules, at);
  }
}

/**
 * Shows the cached releases first (`cached`), then checks the relays: only releases that changed are downloaded, and
 * each faction is shown and saved as it arrives, so an interrupted load keeps what it got. Once every faction is read
 * the rules are `relays`; a faction the relays didn't return keeps its cached release. When the relays can't be
 * reached the cached copy stays (`offline`), or there is nothing (`failed`). Returns a function that stops updates.
 */
export function watchReleasedFiles({ load, cache, onChange, now = Date.now }: Options): () => void {
  let stopped = false;
  const report: Options['onChange'] = (...args) => !stopped && onChange(...args);

  void (async () => {
    const saved = await cache.read().catch(() => null);
    const shown = new Shown(saved, cache);

    if (saved) report(saved.rules, 'cached', saved.savedAt);

    const progress = (rules: ReleasedRules) => {
      report(shown.add(rules), saved ? 'cached' : 'loading', shown.savedAt);
      void shown.save(now());
    };

    try {
      const rules = shown.add(await load(shown.rules, progress));
      const at = now();

      report(rules, 'relays', at);
      await shown.save(at, true);
    } catch {
      if (shown.arrived) await shown.save(now(), true);
      report(shown.rules, shown.rules ? 'offline' : 'failed', shown.rules ? shown.savedAt : null);
    }
  })();

  return () => {
    stopped = true;
  };
}
