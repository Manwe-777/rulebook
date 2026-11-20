import { Library, mergeFiles } from '@rulebook/rules';
import type { ReleaseInfo, ReleaseSource } from '@rulebook/sharing';
import { rememberRelays } from '@rulebook/sharing/relays';
import { useEffect, useState } from 'react';

import { FIXED_RELAYS, OWNER_KEY, RELAYS } from '../constants';
import { loadBundledFiles } from '../sources/loadBundledFiles';

const bundled = Library.fromFiles(loadBundledFiles());
const configured = RELAYS.length > 0 && OWNER_KEY !== '';

export type BuilderSource = 'demo' | ReleaseSource;

export interface BuilderRules {
  library: Library;
  status: BuilderSource;
  /** The release each relay faction (and core) is on; empty for the bundled demo. */
  releases: ReleaseInfo[];
  /** When the relays last gave these rules (ms since epoch); null when they never have on this device. */
  checkedAt: number | null;
}

/**
 * The demo library, then (when relays are configured) the releases saved on this device and the newest from the
 * relays, so the builder works offline once it has loaded them.
 */
export function useBuilderLibrary(): BuilderRules {
  const [rules, setRules] = useState<BuilderRules>({
    library: bundled,
    status: configured ? 'loading' : 'demo',
    releases: [],
    checkedAt: null,
  });

  useEffect(() => {
    if (!configured) return;

    let stop: () => void = () => undefined;
    let cancelled = false;

    import('@rulebook/sharing').then(({ loadRemoteReleases, ReleaseCache, watchReleasedFiles }) => {
      if (cancelled) return;

      stop = watchReleasedFiles({
        // Relays that announced themselves are checked in the background and remembered for the next visit.
        load: () => loadRemoteReleases(RELAYS, OWNER_KEY, (announced) => void rememberRelays(announced, FIXED_RELAYS)),
        cache: new ReleaseCache(OWNER_KEY),
        onChange: (remote, status, checkedAt) =>
          setRules((current) =>
            remote
              ? {
                  library: Library.fromFiles(mergeFiles(loadBundledFiles(), remote.files)),
                  status,
                  releases: remote.releases,
                  checkedAt,
                }
              : { ...current, status },
          ),
      });
    });

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return rules;
}
