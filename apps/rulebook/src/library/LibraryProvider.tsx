import { Library, mergeFiles } from '@rulebook/rules';
import { type ReactNode, useEffect, useState } from 'react';

import { OWNER_KEY, RELAYS } from '../constants';
import { loadBundledFiles } from '../sources/loadBundledFiles';
import { bundledLibrary } from './bundledLibrary';
import { FilesContext } from './FilesContext';
import { LibraryContext } from './LibraryContext';
import { SourceContext, type SourceStatus } from './SourceContext';

const configured = RELAYS.length > 0 && OWNER_KEY !== '';

/**
 * Provides the library: the bundled demo content first (matching the prerendered pages), then, when relays are
 * configured, the newest releases from them on top.
 */
export default function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState(bundledLibrary);
  const [files, setFiles] = useState(loadBundledFiles);
  const [status, setStatus] = useState<SourceStatus>(configured ? 'loading' : 'demo');

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;

    import('@rulebook/sharing')
      .then(({ loadRemoteFiles }) => loadRemoteFiles(RELAYS, OWNER_KEY))
      .then((remote) => {
        if (cancelled) return;

        const merged = mergeFiles(loadBundledFiles(), remote);

        setFiles(merged);
        setLibrary(Library.fromFiles(merged));
        setStatus('relays');
      })
      .catch(() => !cancelled && setStatus('failed'));

    return () => {
      cancelled = true;
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
