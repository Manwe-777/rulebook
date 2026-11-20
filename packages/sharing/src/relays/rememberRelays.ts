import type { RelayAnnouncement } from '../schemas';
import { loadKnownRelays, saveKnownRelays } from './knownRelaysStore';
import { refreshKnownRelays } from './refreshKnownRelays';

/**
 * Checks the relays that announced themselves and the ones this browser knew, and saves the ones that answer for the
 * next visit. `fixed` are the relays the app always uses (project.json).
 */
export async function rememberRelays(announced: RelayAnnouncement[], fixed: string[]): Promise<void> {
  saveKnownRelays(await refreshKnownRelays(loadKnownRelays(), announced, { skip: fixed }));
}
