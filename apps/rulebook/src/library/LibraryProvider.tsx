import { Library, mergeFiles } from '@rulebook/rules';
import { rememberRelays } from '@rulebook/sharing/relays';
import { type ReactNode, useEffect, useState } from 'react';

import { FIXED_RELAYS, OWNER_KEY, RELAYS } from '../constants';
import { loadBundledFiles } from '../sources/loadBundledFiles';
import { bundledLibrary } from './bundledLibrary';
import { FilesContext } from './FilesContext';
import { LibraryContext } from './LibraryContext';
import { SourceContext, type SourceStatus } from './SourceContext';

const configured = RELAYS.length > 0 && OWNER_KEY !== '';

/**
 * Provides the library: the bundled demo content first (matching the prerendered pages), then, when relays are
 * configured, the releases saved on this device and the newest from the relays on top.
 */
export default function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState(bundledLibrary);
  const [files, setFiles] = useState(loadBundledFiles);
  const [status, setStatus] = useState<SourceStatus>(configured ? 'loading' : 'demo');

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
        onChange: (remote, source) => {
          if (remote) {
            const merged = mergeFiles(loadBundledFiles(), remote.files);

            setFiles(merged);
            setLibrary(Library.fromFiles(merged));
          }

          setStatus(source);
        },
      });
    });

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return (
    <LibraryContext value={library}>
      <FilesContext value={files}>
        <SourceContext value={status}>{children}</SourceContext>
      </FilesContext>
    </LibraryContext>
  );
}
