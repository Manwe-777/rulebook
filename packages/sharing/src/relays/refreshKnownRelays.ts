import type { RelayAnnouncement } from '../schemas';
import { KnownRelays } from './KnownRelays';
import { pingRelay } from './pingRelay';

/**
 * Adds freshly announced relays to the known list, then checks every known relay once: those that answer are kept,
 * those failing too often are dropped. `skip` are addresses the app always uses (project.json), not tracked here.
 */
export async function refreshKnownRelays(
  known: KnownRelays,
  announced: RelayAnnouncement[],
  options: { skip?: string[]; now?: number; ping?: (url: string) => Promise<number | null> } = {},
): Promise<KnownRelays> {
  const { skip = [], now = Date.now(), ping = (url) => pingRelay(url) } = options;
  const merged = known.add(announced.map((r) => r.url).filter((url) => !skip.includes(url)));
  const results = await Promise.all(merged.urls.map(async (url) => ({ url, ok: (await ping(url)) !== null })));

  return results.reduce((list, { url, ok }) => list.record(url, ok, now), merged);
}
