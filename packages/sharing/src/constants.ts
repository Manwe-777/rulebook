/**
 * Where the apps keep how this browser signs (`localStorage`). The rulebook and the list builder share it, so hosted on
 * the same site they use the same identity.
 */
export const IDENTITY_KEY = 'rulebook:identity';

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

/** Factions loaded from the relays at the same time; more at once makes reads time out. */
export const PARALLEL_FACTIONS = 6;

/** How long role and hidden lists are cached by the write rules, in milliseconds. */
export const ROLE_CACHE_MS = 30_000;

/** Every key the project uses, with `/` between parts (tool-db keeps `.` for namespaces). `f` is a faction id, `h` a SHA-256 hash in hex, `p` a public key. */
export const KEYS = {
  maintainers: (f: string) => `maintainers/${f}`,
  contributors: (f: string) => `contributors/${f}`,
  blob: (h: string) => `blob/${h}`,
  release: (f: string, h: string) => `release/${f}/${h}`,
  review: (f: string, p: string, n: string) => `review/${f}/${p}/${n}`,
  hidden: 'hidden',
  proposal: (f: string, n: string) => `proposal/${f}/${n}`,
  list: (n: string) => `list/${n}`,
  relay: (p: string) => `relay/${p}`,
  /** Map CRDTs: see docs/sharing.md. */
  index: 'index',
  releases: (f: string) => `releases/${f}`,
  heads: (f: string) => `heads/${f}`,
  proposals: (f: string) => `proposals/${f}`,
  requests: (f: string) => `requests/${f}`,
  relays: 'relays',
} as const;

/** A relay re-announces its address this often, in milliseconds. */
export const RELAY_ANNOUNCE_MS = 6 * 60 * 60 * 1000;

/** Announcements older than this are ignored: the relay has stopped saying it is there. */
export const RELAY_STALE_MS = 2 * 24 * 60 * 60 * 1000;

/** A known relay that fails this many checks in a row is dropped until it announces itself again. */
export const RELAY_MAX_FAILURES = 3;

/**
 * How long a relay check waits for the connection to open, in milliseconds. Generous on purpose: a page busy loading
 * rules, or a phone network, can take seconds to open a socket to a relay that works, and failed checks drop relays.
 */
export const RELAY_PING_TIMEOUT_MS = 10_000;

/** localStorage key of the relays a browser has found, shared by both apps on one site. */
export const KNOWN_RELAYS_KEY = 'rulebook:relays';

/** IndexedDB database the browser apps keep released rules in. */
export const CACHE_DB = 'rulebook-cache';

/** tool-db's type name for map CRDTs, which every list key holds. */
export const MAP_TYPE = 'MAP';

/** First part of every key that holds a map CRDT. */
export const MAP_TYPES = ['index', 'releases', 'heads', 'proposals', 'requests', 'relays'];
