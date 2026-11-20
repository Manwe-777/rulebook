import { KNOWN_RELAYS_KEY } from '../constants';
import { KnownRelays } from './KnownRelays';

/** The relays this browser has found, or none (also when storage is unavailable, as when prerendering). */
export function loadKnownRelays(): KnownRelays {
  try {
    return KnownRelays.fromSave(JSON.parse(globalThis.localStorage?.getItem(KNOWN_RELAYS_KEY) ?? 'null'));
  } catch {
    return KnownRelays.empty();
  }
}

/** Remembers the relays this browser has found, for the next visit. */
export function saveKnownRelays(relays: KnownRelays): void {
  try {
    globalThis.localStorage?.setItem(KNOWN_RELAYS_KEY, JSON.stringify(relays));
  } catch {
    // Storage full or blocked: the next visit starts from project.json again.
  }
}
