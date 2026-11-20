import { useEffect, useState } from 'react';

import { linkFromHash } from '../utils/linkFromHash';

/**
 * A device link in the address (`#link=…`), from opening its QR code or pasting it into an open tab, and a way to
 * drop it: the hash is removed so a reload doesn't ask again.
 */
export function useIncomingLink(): [string | null, () => void] {
  const [link, setLink] = useState(() => linkFromHash(window.location.hash));

  useEffect(() => {
    const changed = () => setLink(linkFromHash(window.location.hash));

    window.addEventListener('hashchange', changed);

    return () => window.removeEventListener('hashchange', changed);
  }, []);

  const drop = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setLink(null);
  };

  return [link, drop];
}
