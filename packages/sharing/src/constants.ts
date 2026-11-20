/** The tool-db topic every Rulebook app and relay shares. */
export const TOPIC = 'rulebook-40k';

/** Faction id of the core data (muster rules). */
export const CORE = 'core';

/** Largest record text accepted, in bytes, to stay under public relays' message limits. */
export const MAX_BLOB_BYTES = 48_000;

/**
 * How long a read waits for the relays, in milliseconds. A read ends as soon as every relay answered, so this only
 * matters for slow ones; tool-db's own default (1 s) drops answers when many reads run at once.
 */
export const READ_TIMEOUT_MS = 8000;

/** How long role and hidden lists are cached by the write rules, in milliseconds. */
export const ROLE_CACHE_MS = 30_000;

/** Every key the project uses, with `/` between parts (tool-db keeps `.` for namespaces). `f` is a faction id, `h` a SHA-256 hash in hex, `p` a public key. */
export const KEYS = {
  maintainers: (f: string) => `maintainers/${f}`,
  contributors: (f: string) => `contributors/${f}`,
  blob: (h: string) => `blob/${h}`,
  head: (f: string, kind: string, id: string) => `head/${f}/${kind}/${id}`,
  headPrefix: (f: string) => `head/${f}/`,
  release: (f: string, h: string) => `release/${f}/${h}`,
  releasePrefix: (f: string) => `release/${f}/`,
  review: (f: string, p: string, n: string) => `review/${f}/${p}/${n}`,
  hidden: 'hidden',
  proposal: (f: string, n: string) => `proposal/${f}/${n}`,
  request: (f: string) => `request/${f}`,
  list: (n: string) => `list/${n}`,
  relay: (p: string) => `relay/${p}`,
  relayPrefix: 'relay/',
} as const;

/** A relay re-announces its address this often, in milliseconds. */
export const RELAY_ANNOUNCE_MS = 6 * 60 * 60 * 1000;

/** Announcements older than this are ignored: the relay has stopped saying it is there. */
export const RELAY_STALE_MS = 2 * 24 * 60 * 60 * 1000;

/** A known relay that fails this many checks in a row is dropped until it announces itself again. */
export const RELAY_MAX_FAILURES = 3;

/** localStorage key of the relays a browser has found, shared by both apps on one site. */
export const KNOWN_RELAYS_KEY = 'rulebook:relays';

/** IndexedDB database the browser apps keep released rules in. */
export const CACHE_DB = 'rulebook-cache';
