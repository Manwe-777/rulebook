import { KEYS } from '../constants';
import { parseKey } from '../rules/parseKey';
import { headSchema, manifestSchema, relaySchema, requestSchema } from '../schemas';

/** A value stored under a key before the lists moved into maps: who signed it, when, and what it holds. */
export interface LegacyValue {
  key: string;
  author: string;
  createdAt: number;
  value: unknown;
}

/** Map key → entry → value. */
export type MapEntries = Record<string, Record<string, unknown>>;

type IsMaintainer = (faction: string, pubkey: string) => Promise<boolean>;

interface Entry {
  map: string;
  entry: string;
  value: unknown;
}

/** A user's own request or proposal; only that user could sign it. */
function namespacedEntry(owner: string, parts: string[], { author, value }: LegacyValue): Entry | null {
  const [type, faction, n] = parts;

  if (owner !== author) return null;
  if (type === 'request' && parts.length === 2 && requestSchema.safeParse(value).success)
    return { map: KEYS.requests(faction), entry: owner, value };
  if (type === 'proposal' && parts.length === 3)
    return { map: KEYS.proposals(faction), entry: `${owner}/${n}`, value: {} };

  return null;
}

/** A relay's own announcement. */
function relayEntry(relay: string, { author, value }: LegacyValue): Entry | null {
  const parsed = relaySchema.safeParse(value);

  if (relay !== author || !parsed.success) return null;

  return { map: KEYS.relays, entry: author, value: { url: parsed.data.url, name: parsed.data.name } };
}

/** A head or release, signed by a maintainer of its faction. */
function factionEntry(parts: string[], { value }: LegacyValue): Entry | null {
  const [type, faction, a, b] = parts;

  if (type === 'head' && parts.length === 4) {
    const head = headSchema.safeParse(value);

    return head.success ? { map: KEYS.heads(faction), entry: `${a}/${b}`, value: head.data } : null;
  }

  const manifest = manifestSchema.safeParse(value);

  if (type !== 'release' || parts.length !== 3 || !manifest.success || manifest.data.faction !== faction) return null;

  return { map: KEYS.releases(faction), entry: a, value: { version: manifest.data.version, date: manifest.data.date } };
}

/** The map entry one old value becomes, or null when it doesn't become one or its signer wasn't allowed to write it. */
async function toEntry(old: LegacyValue, isMaintainer: IsMaintainer): Promise<Entry | null> {
  const { owner, parts } = parseKey(old.key);

  if (owner) return namespacedEntry(owner, parts, old);
  if (parts[0] === 'relay') return relayEntry(parts[1], old);
  if (parts[0] !== 'head' && parts[0] !== 'release') return null;

  return (await isMaintainer(parts[1], old.author)) ? factionEntry(parts, old) : null;
}

/** The `index` entry of each faction: its newest release among the `releases/<f>` entries, with its full manifest. */
function indexEntries(maps: MapEntries, values: LegacyValue[]): Record<string, unknown> {
  const index: Record<string, unknown> = {};

  for (const [map, entries] of Object.entries(maps)) {
    const [type, faction] = map.split('/');

    if (type !== 'releases') continue;

    const [hash] = Object.entries(entries as Record<string, { date: string }>).sort(([, a], [, b]) =>
      b.date.localeCompare(a.date),
    )[0];

    const manifest = manifestSchema.parse(values.find((v) => v.key === KEYS.release(faction, hash))!.value);
    const { version, date, notes, records } = manifest;

    index[faction] = { hash, version, date, notes, records: Object.keys(records).length };
  }

  return index;
}

/**
 * The map entries the old key-per-item data becomes (docs/sharing.md), for moving existing data into the maps once:
 * heads, releases, relays, requests and proposals, each from a signer the old write rules allowed, the newest such
 * value per key; and the `index`, pointing each faction at its newest release.
 */
export async function legacyIndexes(values: LegacyValue[], isMaintainer: IsMaintainer): Promise<MapEntries> {
  // The newest trusted value of each key: an untrusted write never hides a trusted one.
  const newest = new Map<string, { old: LegacyValue; entry: Entry }>();

  for (const old of values) {
    const entry = await toEntry(old, isMaintainer);
    const known = newest.get(old.key);

    if (entry && (!known || old.createdAt > known.old.createdAt)) newest.set(old.key, { old, entry });
  }

  const maps: MapEntries = {};

  for (const { entry } of newest.values()) (maps[entry.map] ??= {})[entry.entry] = entry.value;

  const index = indexEntries(
    maps,
    [...newest.values()].map((n) => n.old),
  );

  return Object.keys(index).length ? { ...maps, [KEYS.index]: index } : maps;
}
