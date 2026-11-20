import type { z } from 'zod';

import {
  headSchema,
  indexEntrySchema,
  proposalRefSchema,
  relayEntrySchema,
  releaseEntrySchema,
  requestSchema,
} from '../schemas';
import { parseKey } from './parseKey';
import type { Roles } from './Roles';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX64 = /^[0-9a-f]{64}$/;
const RECORD = /^[a-z0-9]+(-[a-z0-9]+)*\/[a-z0-9-]+$/;
const PROPOSAL = /^([0-9a-f]{64})\/[a-z0-9]+$/;

/** One change of a map CRDT, as tool-db stores it: set or delete `k`, by `a`. */
interface MapChange {
  t: 'SET' | 'DEL';
  a: string;
  k: string;
  v?: unknown;
}

/** What may sit in one kind of map: the entry key's shape, the value's schema, and who may set an entry. */
interface MapRule {
  /** How many parts the map's key has: `index` 1, `heads/<f>` 2. */
  parts: number;
  entry: RegExp;
  schema: z.ZodType;
  allowed: (roles: Roles, author: string, entry: string, faction: string) => Promise<boolean>;
}

const maintainerOf = (roles: Roles, author: string, faction: string) => roles.isMaintainer(faction, author);

const MAPS: Record<string, MapRule> = {
  index: { parts: 1, entry: SLUG, schema: indexEntrySchema, allowed: (r, a, entry) => maintainerOf(r, a, entry) },
  releases: { parts: 2, entry: HEX64, schema: releaseEntrySchema, allowed: (r, a, _, f) => maintainerOf(r, a, f) },
  heads: { parts: 2, entry: RECORD, schema: headSchema, allowed: (r, a, _, f) => maintainerOf(r, a, f) },
  proposals: {
    parts: 2,
    entry: PROPOSAL,
    schema: proposalRefSchema,
    allowed: async (r, a, entry, f) => PROPOSAL.exec(entry)?.[1] === a && (await r.isContributor(f, a)),
  },
  requests: { parts: 2, entry: HEX64, schema: requestSchema, allowed: async (_, a, entry) => entry === a },
  relays: { parts: 1, entry: HEX64, schema: relayEntrySchema, allowed: async (_, a, entry) => entry === a },
};

function isChange(value: unknown): value is MapChange {
  if (typeof value !== 'object' || value === null) return false;

  const { t, a, k } = value as Record<string, unknown>;

  return (t === 'SET' || t === 'DEL') && typeof a === 'string' && typeof k === 'string';
}

/** Whether one change fits its map: entry key shape, value, and an author allowed to set that entry. */
async function validChange(roles: Roles, rule: MapRule, faction: string, change: unknown): Promise<boolean> {
  if (!isChange(change) || !rule.entry.test(change.k)) return false;
  if (change.t === 'SET' && !rule.schema.safeParse(change.v).success) return false;

  return change.a === roles.owner || rule.allowed(roles, change.a, change.k, faction);
}

/**
 * A change set written to a map key: every change in it fits the map (docs/sharing.md, the table of maps). The owner
 * may set any entry. One bad change rejects the whole change set.
 */
export async function validMapWrite(roles: Roles, key: string, changes: unknown): Promise<boolean> {
  const { owner, parts } = parseKey(key);
  const rule = MAPS[parts[0]];

  if (owner || !rule || parts.length !== rule.parts || !Array.isArray(changes) || !changes.length) return false;

  const results = await Promise.all(changes.map((c) => validChange(roles, rule, parts[1] ?? '', c)));

  return results.every(Boolean);
}
