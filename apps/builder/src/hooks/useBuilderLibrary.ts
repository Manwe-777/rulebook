import { Library, mergeFiles } from '@rulebook/rules';
import { useEffect, useState } from 'react';

import { OWNER_KEY, RELAYS } from '../constants';
import { loadBundledFiles } from '../sources/loadBundledFiles';

const bundled = Library.fromFiles(loadBundledFiles());
const configured = RELAYS.length > 0 && OWNER_KEY !== '';

/** The demo library, replaced by the newest releases from the relays once they load (when relays are configured). */
export function useBuilderLibrary(): { library: Library; status: 'demo' | 'loading' | 'relays' | 'failed' } {
  const [library, setLibrary] = useState(bundled);
  const [status, setStatus] = useState<'demo' | 'loading' | 'relays' | 'failed'>(configured ? 'loading' : 'demo');

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;

    import('@rulebook/sharing')
      .then(({ loadRemoteFiles }) => loadRemoteFiles(RELAYS, OWNER_KEY))
      .then((remote) => {
        if (cancelled) return;

        setLibrary(Library.fromFiles(mergeFiles(loadBundledFiles(), remote)));
        setStatus('relays');
      })
      .catch(() => !cancelled && setStatus('failed'));

    return () => {
      cancelled = true;
    };
  }, []);

  return { library, status };
}
