import { recordKind } from '@rulebook/rules';
import type { z } from 'zod';

import { MAX_BLOB_BYTES } from '../constants';
import { headSchema, manifestSchema, proposalSchema, requestSchema, reviewSchema, roleListSchema } from '../schemas';
import { canonicalJson } from '../utils/canonicalJson';
import { sha256Hex } from '../utils/sha256Hex';
import { parseKey } from './parseKey';
import type { Roles } from './Roles';

/** What a write rule sees of a value: its key, author and value. */
export interface Write {
  k: string;
  a: string;
  v: unknown;
}

export interface WriteRule {
  /** Applies to every key starting with this. */
  prefix: string;
  check: (write: Write) => Promise<boolean>;
}

/** First part of every shared (not namespaced) key the project uses. */
const SHARED_TYPES = ['maintainers', 'contributors', 'blob', 'head', 'release', 'review'];

const fits = (schema: z.ZodType, value: unknown) => schema.safeParse(value).success;

/**
 * A record text: within the size limit, stored under its own hash, and declaring a kind. The apps check every field
 * when they read it; relays don't, so a relay built before a new field or kind still stores records that use it.
 */
async function validBlob(hash: string | undefined, value: unknown): Promise<boolean> {
  if (typeof value !== 'string' || new TextEncoder().encode(value).length > MAX_BLOB_BYTES) return false;
  if ((await sha256Hex(value)) !== hash) return false;

  return recordKind(value) !== null;
}

async function validRelease(faction: string, hash: string | undefined, value: unknown): Promise<boolean> {
  const manifest = manifestSchema.safeParse(value);

  return manifest.success && manifest.data.faction === faction && (await sha256Hex(canonicalJson(value))) === hash;
}

async function validNamespaced(roles: Roles, { k, a, v }: Write): Promise<boolean> {
  const { parts } = parseKey(k);
  const [type, faction] = parts;

  if (type === 'proposal' && parts.length === 3) {
    return fits(proposalSchema, v) && (await roles.isContributor(faction, a));
  }

  if (type === 'request' && parts.length === 2) return fits(requestSchema, v);

  return type === 'list' && parts.length === 2;
}

/**
 * The write rules of docs/sharing.md, for tool-db custom verificators. Clients and the relay register the same ones,
 * so data that breaks them is dropped wherever it arrives.
 */
export function writeRules(roles: Roles): WriteRule[] {
  const maintainer = (w: Write) => roles.isMaintainer(parseKey(w.k).parts[1], w.a);

  return [
    {
      prefix: '',
      check: async ({ k }) => {
        if (k === 'hidden') return true;

        const { owner, parts } = parseKey(k);
        const [type, hash] = parts;

        if (!owner && !SHARED_TYPES.includes(type)) return false;

        const hidden = await roles.hidden();

        return !hidden.keys.includes(k) && !(type === 'blob' && hidden.blobs.includes(hash));
      },
    },
    { prefix: 'maintainers/', check: async ({ a, v }) => a === roles.owner && fits(roleListSchema, v) },
    { prefix: 'hidden', check: async ({ a }) => a === roles.owner },
    { prefix: 'contributors/', check: async (w) => fits(roleListSchema, w.v) && (await maintainer(w)) },
    {
      prefix: 'head/',
      check: async (w) => parseKey(w.k).parts.length === 4 && fits(headSchema, w.v) && (await maintainer(w)),
    },
    {
      prefix: 'review/',
      check: async (w) => parseKey(w.k).parts.length === 4 && fits(reviewSchema, w.v) && (await maintainer(w)),
    },
    {
      prefix: 'release/',
      check: async (w) => {
        const [, faction, hash] = parseKey(w.k).parts;

        return (await validRelease(faction, hash, w.v)) && (await maintainer(w));
      },
    },
    { prefix: 'blob/', check: async ({ k, v }) => validBlob(parseKey(k).parts[1], v) },
    { prefix: ':', check: (w) => validNamespaced(roles, w) },
  ];
}

/** Registers the write rules on a tool-db client or relay node. */
export function registerWriteRules(
  target: { addCustomVerification: (key: string, fn: (msg: Write) => Promise<boolean>) => unknown },
  roles: Roles,
) {
  for (const rule of writeRules(roles)) target.addCustomVerification(rule.prefix, rule.check);
}
