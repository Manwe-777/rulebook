import { Library, mergeFiles } from '@rulebook/rules';
import type { ReleaseSource } from '@rulebook/sharing';
import { useEffect, useState } from 'react';

import { OWNER_KEY, RELAYS } from '../constants';
import { loadBundledFiles } from '../sources/loadBundledFiles';

const bundled = Library.fromFiles(loadBundledFiles());
const configured = RELAYS.length > 0 && OWNER_KEY !== '';

export type BuilderSource = 'demo' | ReleaseSource;

/**
 * The demo library, then (when relays are configured) the releases saved on this device and the newest from the
 * relays, so the builder works offline once it has loaded them.
 */
export function useBuilderLibrary(): { library: Library; status: BuilderSource } {
  const [library, setLibrary] = useState(bundled);
  const [status, setStatus] = useState<BuilderSource>(configured ? 'loading' : 'demo');

  useEffect(() => {
    if (!configured) return;

    let stop: () => void = () => undefined;
    let cancelled = false;

    import('@rulebook/sharing').then(({ loadRemoteFiles, ReleaseCache, watchReleasedFiles }) => {
      if (cancelled) return;

      stop = watchReleasedFiles({
        load: () => loadRemoteFiles(RELAYS, OWNER_KEY),
        cache: new ReleaseCache(OWNER_KEY),
        onChange: (remote, source) => {
          if (remote) setLibrary(Library.fromFiles(mergeFiles(loadBundledFiles(), remote)));
          setStatus(source);
        },
      });
    });

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return { library, status };
}
