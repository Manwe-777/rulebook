import type { RulesFile } from '@rulebook/rules';
import { z } from 'zod';

const hash = z.string().regex(/^[0-9a-f]{64}$/, 'must be a SHA-256 hash in hex');
const pubkey = z.string().regex(/^[0-9a-f]{64}$/, 'must be a public key in hex');
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** A record kind; any name, so relays need no update when a new kind is added. */
const kind = slug;

/** `maintainers.<f>` and `contributors.<f>`. */
export const roleListSchema = z.strictObject({ keys: z.array(pubkey) });

/** `head.<f>.<kind>.<id>`: the accepted version of a record. */
export const headSchema = z.strictObject({ blob: hash, proposal: z.string().optional() });

/** `release.<f>.<h>`: a fixed snapshot of one faction. */
export const manifestSchema = z.strictObject({
  faction: slug,
  version: z.string().min(1),
  date: z.string().min(1),
  core: hash.optional(),
  /** `kind/id` to the hash of that record's text. */
  records: z.record(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*\/[a-z0-9-]+$/), hash),
  notes: z.string().default(''),
});

/** `relay/<p>`: a relay node saying where it can be reached, signed with that relay's own key. */
export const relaySchema = z.strictObject({
  url: z.string().regex(/^wss?:\/\/\S+$/, 'must be a ws:// or wss:// address'),
  name: z.string().max(60).default(''),
  /** When the relay last announced itself, ISO 8601. */
  updated: z.string().min(1),
});

/** A relay as the apps list it: its key (the relay's public key) and its announcement. */
export type RelayAnnouncement = z.output<typeof relaySchema> & { key: string };

/** `review.<f>.<proposal>`. */
export const reviewSchema = z.strictObject({
  status: z.enum(['accepted', 'rejected']),
  comment: z.string().default(''),
});

/** `hidden`: content the owner took down. */
export const hiddenSchema = z.strictObject({
  keys: z.array(z.string()).default([]),
  blobs: z.array(hash).default([]),
  reason: z.string().default(''),
});

/** `:<p>.proposal.<f>.<n>`: a change a contributor asks for. */
export const proposalSchema = z.strictObject({
  kind,
  id: slug,
  base: hash.optional(),
  blob: hash,
  note: z.string().default(''),
});

/** `:<p>.request.<f>`: asks to become a contributor. */
export const requestSchema = z.strictObject({ message: z.string().default('') });

export type Manifest = z.output<typeof manifestSchema>;
export type Proposal = z.output<typeof proposalSchema>;
export type Hidden = z.output<typeof hiddenSchema>;

/** What the apps show about a release: which version, when, and how many records it holds. */
export interface ReleaseInfo {
  faction: string;
  version: string;
  date: string;
  hash: string;
  notes: string;
  records: number;
}

/** The newest release of every faction: their record files, and what each release is. */
export interface ReleasedRules {
  files: RulesFile[];
  releases: ReleaseInfo[];
}
