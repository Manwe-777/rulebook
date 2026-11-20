import { loadRelayAnnouncements, type RelayAnnouncement } from '@rulebook/sharing';
import { loadKnownRelays, pingRelay } from '@rulebook/sharing/relays';
import { useEffect, useState } from 'react';

import { FIXED_RELAYS, OWNER_KEY, RELAYS } from '../constants';
import { type RelayRow, relayRows } from '../utils/relayRows';

/**
 * The relays this site knows of, with their announcements, read from the relays, and how long each takes to answer
 * from this browser. `error` is set when no relay could be reached; `readAt` is when the announcements were read.
 */
export function useRelayStatus(): { rows: RelayRow[]; loading: boolean; error: string | null; readAt: number } {
  const [announced, setAnnounced] = useState<RelayAnnouncement[]>([]);
  const [pings, setPings] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(RELAYS.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [readAt, setReadAt] = useState(0);

  useEffect(() => {
    if (!RELAYS.length) return;

    let live = true;

    loadRelayAnnouncements(RELAYS, OWNER_KEY)
      .then((found) => {
        if (!live) return;
        setAnnounced(found);
        setReadAt(Date.now());
      })
      .catch((e: Error) => live && setError(e.message))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, []);

  const urls = [...new Set([...FIXED_RELAYS, ...announced.map((a) => a.url)])];

  useEffect(() => {
    let live = true;

    for (const url of urls) {
      void pingRelay(url).then((ms) => live && setPings((p) => ({ ...p, [url]: ms })));
    }

    return () => {
      live = false;
    };
    // Ping each address once, when it first shows up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join(',')]);

  return { rows: relayRows(FIXED_RELAYS, announced, loadKnownRelays().all, pings), loading, error, readAt };
}
