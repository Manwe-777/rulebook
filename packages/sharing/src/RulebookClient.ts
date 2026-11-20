import { parseRecord, type RulesFile } from '@rulebook/rules';
import { MapCrdt, type ToolDb } from 'tool-db';
import type { z } from 'zod';

import { KEYS, PARALLEL_FACTIONS, READ_TIMEOUT_MS, RELAY_STALE_MS } from './constants';
import { parseKey } from './rules/parseKey';
import { Roles } from './rules/Roles';
import { registerWriteRules } from './rules/writeRules';
import {
  headSchema,
  indexEntrySchema,
  type Manifest,
  manifestSchema,
  type Proposal,
  proposalRefSchema,
  proposalSchema,
  type RelayAnnouncement,
  relayEntrySchema,
  relaySchema,
  type ReleasedRules,
  releaseEntrySchema,
  type ReleaseInfo,
  requestSchema,
  reviewSchema,
} from './schemas';
import { canonicalJson } from './utils/canonicalJson';
import { mapInBatches } from './utils/mapInBatches';
import { sha256Hex } from './utils/sha256Hex';

type Kind = Proposal['kind'];
type IndexEntry = z.output<typeof indexEntrySchema>;

export interface ProposalEntry extends Proposal {
  /** The proposal's final key, `:<p>.proposal/<f>/<n>`. */
  key: string;
  author: string;
  review?: { status: 'accepted' | 'rejected'; comment: string };
}

/** Path a record gets when a release is turned into files for `Library.fromFiles`. */
function recordFile(faction: string, kind: string, id: string): string {
  return kind === 'faction' ? `${faction}/faction.md` : `${faction}/${id}.md`;
}

/** What `latestReleases` already has, and who wants each faction as soon as it is read. */
export interface LatestOptions {
  have?: ReleaseInfo[];
  onRelease?: (rules: ReleasedRules) => void;
}

/**
 * Reads and writes Rulebook data in tool-db: record texts, roles, proposals, reviews and releases. Registers the
 * write rules on the database, so everything it reads has been checked.
 */
export class RulebookClient {
  readonly roles: Roles;

  constructor(
    private db: ToolDb,
    owner: string,
    roleCacheMs?: number,
  ) {
    this.roles = new Roles(owner, (key) => db.getData(key, false, READ_TIMEOUT_MS), roleCacheMs);
    registerWriteRules(db, this.roles);
  }

  /** The signed-in user's public key. */
  get me(): string {
    return this.db.userAccount.getAddress() ?? '';
  }

  /**
   * Reads a value, or null when it is hidden. Values cached before they were hidden are not checked again by tool-db,
   * so every read checks the hidden list.
   */
  private async get<T = unknown>(key: string): Promise<T | null> {
    const hidden = await this.roles.hidden();
    const { parts } = parseKey(key);

    if (hidden.keys.includes(key) || (parts[0] === 'blob' && hidden.blobs.includes(parts[1]))) return null;

    return this.db.getData<T>(key, false, READ_TIMEOUT_MS);
  }

  private async put(key: string, value: unknown, namespaced = false): Promise<void> {
    await this.db.putData(key, value, namespaced);
  }

  /**
   * The entries of a map key that parse with `schema`. One exact-key read: the relays send that key's change sets
   * only, and the write rules have checked every change.
   */
  private async map<T>(key: string, schema: z.ZodType<T>): Promise<Record<string, T>> {
    const crdt = new MapCrdt<unknown>(this.me);

    await this.db.getCrdt(key, crdt, false, READ_TIMEOUT_MS);

    const entries: Record<string, T> = {};

    for (const [entry, value] of Object.entries(crdt.value)) {
      const parsed = schema.safeParse(value);

      if (parsed.success) entries[entry] = parsed.data;
    }

    return entries;
  }

  /** Sets (or, with `undefined`, deletes) one entry of a map key, on top of the changes known for it. */
  private async setEntry(key: string, entry: string, value: unknown): Promise<void> {
    await this.setEntries(key, { [entry]: value });
  }

  /**
   * Sets (or, with `undefined`, deletes) entries of a map key in one change set. Entries that already hold the same
   * value are left alone, so writing the same data again adds nothing. The map's write rules decide which entries the
   * signed-in key may set; the owner may set any.
   */
  async setEntries(key: string, entries: Record<string, unknown>): Promise<void> {
    const crdt = new MapCrdt<unknown>(this.me);

    await this.db.getCrdt(key, crdt, false, READ_TIMEOUT_MS);

    const current = crdt.value;

    for (const [entry, value] of Object.entries(entries)) {
      if (value === undefined) {
        if (entry in current) crdt.DEL(entry);
      } else if (canonicalJson(current[entry]) !== canonicalJson(value)) crdt.SET(entry, value);
    }

    await this.db.putCrdt(key, crdt);
  }

  /** Stores a record's text under its hash and returns the hash. */
  async putBlob(text: string): Promise<string> {
    const hash = await sha256Hex(text);

    await this.put(KEYS.blob(hash), text);

    return hash;
  }

  async getBlob(hash: string): Promise<string | null> {
    const text = await this.get<string>(KEYS.blob(hash));

    return typeof text === 'string' && (await sha256Hex(text)) === hash ? text : null;
  }

  /** Owner only. */
  async setMaintainers(faction: string, keys: string[]) {
    await this.put(KEYS.maintainers(faction), { keys });
    this.roles.clear();
  }

  /** Maintainers only. */
  async setContributors(faction: string, keys: string[]) {
    await this.put(KEYS.contributors(faction), { keys });
    this.roles.clear();
  }

  async requestAccess(faction: string, message: string) {
    await this.setEntry(KEYS.requests(faction), this.me, { message });
  }

  /** Open contributor requests for a faction, from people who are not contributors yet. */
  async requests(faction: string): Promise<{ author: string; message: string }[]> {
    const found = Object.entries(await this.map(KEYS.requests(faction), requestSchema));
    const open = await Promise.all(found.map(async ([author]) => !(await this.roles.isContributor(faction, author))));

    return found.filter((_, i) => open[i]).map(([author, { message }]) => ({ author, message }));
  }

  /** Proposes a new version of a record. Returns the proposal's key. */
  async propose(faction: string, change: { kind: Kind; id: string; text: string; note?: string }): Promise<string> {
    const head = await this.head(faction, change.kind, change.id);
    const blob = await this.putBlob(change.text);
    const n = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const proposal = { kind: change.kind, id: change.id, base: head ?? undefined, blob, note: change.note ?? '' };

    await this.put(KEYS.proposal(faction, n), proposal, true);
    await this.setEntry(KEYS.proposals(faction), `${this.me}/${n}`, {});

    return `:${this.me}.${KEYS.proposal(faction, n)}`;
  }

  /** Every proposal for a faction from its contributors, with its review if it has one. */
  async proposals(faction: string): Promise<ProposalEntry[]> {
    const refs = Object.keys(await this.map(KEYS.proposals(faction), proposalRefSchema));

    const entries = await Promise.all(
      refs.map((ref) => {
        const [author, n] = ref.split('/');

        return this.proposal(faction, `:${author}.${KEYS.proposal(faction, n)}`);
      }),
    );

    return entries.filter((e): e is ProposalEntry => e !== null);
  }

  private async proposal(faction: string, key: string): Promise<ProposalEntry | null> {
    const parsed = proposalSchema.safeParse(await this.get(key));
    const author = parseKey(key).owner!;

    if (!parsed.success) return null;

    const review = reviewSchema.safeParse(await this.get(this.reviewKey(faction, key)));

    return { ...parsed.data, key, author, review: review.success ? review.data : undefined };
  }

  private reviewKey(faction: string, proposalKey: string): string {
    const { owner, parts } = parseKey(proposalKey);

    return KEYS.review(faction, owner!, parts[2]);
  }

  /** Maintainers only: makes the proposal the record's accepted version. */
  async accept(faction: string, proposal: ProposalEntry, comment = '') {
    await this.setEntry(KEYS.heads(faction), `${proposal.kind}/${proposal.id}`, {
      blob: proposal.blob,
      proposal: proposal.key,
    });

    await this.put(this.reviewKey(faction, proposal.key), { status: 'accepted', comment });
  }

  /** Maintainers only. */
  async reject(faction: string, proposal: ProposalEntry, comment: string) {
    await this.put(this.reviewKey(faction, proposal.key), { status: 'rejected', comment });
  }

  /** Maintainers only: changes a record without a proposal. */
  async edit(faction: string, kind: Kind, id: string, text: string) {
    await this.setEntry(KEYS.heads(faction), `${kind}/${id}`, { blob: await this.putBlob(text) });
  }

  /** Hash of a record's accepted text, or null. */
  async head(faction: string, kind: Kind, id: string): Promise<string | null> {
    return (await this.heads(faction))[`${kind}/${id}`] ?? null;
  }

  /** Every accepted record of a faction, as `kind/id` to the hash of its text; hidden texts are left out. */
  async heads(faction: string): Promise<Record<string, string>> {
    const hidden = (await this.roles.hidden()).blobs;
    const records: Record<string, string> = {};

    for (const [record, head] of Object.entries(await this.map(KEYS.heads(faction), headSchema))) {
      if (!hidden.includes(head.blob)) records[record] = head.blob;
    }

    return records;
  }

  /** Maintainers only: publishes the current heads of a faction as a release. Returns the release hash. */
  async release(faction: string, version: string, notes = '', core?: string): Promise<string> {
    const manifest = {
      faction,
      version,
      date: new Date().toISOString(),
      core,
      records: await this.heads(faction),
      notes,
    };

    const value = JSON.parse(canonicalJson(manifest));
    const hash = await sha256Hex(canonicalJson(value));

    await this.put(KEYS.release(faction, hash), value);
    await this.setEntry(KEYS.releases(faction), hash, { version, date: manifest.date });

    await this.setEntry(KEYS.index, faction, {
      hash,
      version,
      date: manifest.date,
      records: Object.keys(manifest.records).length,
      notes,
    });

    return hash;
  }

  /** Signs an existing release again, so it stays trusted when its first signer stops being a maintainer. */
  async cosign(faction: string, hash: string) {
    const manifest = await this.get(KEYS.release(faction, hash));

    if (manifest) await this.put(KEYS.release(faction, hash), manifest);
  }

  /** Every trusted release of a faction, newest first. */
  async releases(faction: string): Promise<(Manifest & { hash: string })[]> {
    const hashes = Object.keys(await this.map(KEYS.releases(faction), releaseEntrySchema));

    return this.manifests(hashes.map((h) => KEYS.release(faction, h)));
  }

  /** The trusted releases stored under these release keys, newest first. */
  private async manifests(keys: string[]): Promise<(Manifest & { hash: string })[]> {
    const found = await Promise.all(
      keys.map(async (key) => ({
        hash: parseKey(key).parts[2],
        parsed: manifestSchema.safeParse(await this.get(key)),
      })),
    );

    return found
      .flatMap(({ hash, parsed }) => (parsed.success ? [{ ...parsed.data, hash }] : []))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /** Relay nodes only: says where this relay can be reached, signed with the relay's own key. */
  async announceRelay(url: string, name = '', now = new Date()): Promise<void> {
    const listed = (await this.map(KEYS.relays, relayEntrySchema))[this.me];

    if (listed?.url !== url || listed.name !== name) await this.setEntry(KEYS.relays, this.me, { url, name });

    await this.put(KEYS.relay(this.me), { url, name, updated: now.toISOString() });
  }

  /** Relays that announced themselves recently, newest first. Older announcements are left out. */
  async relays(now = Date.now()): Promise<RelayAnnouncement[]> {
    const keys = Object.keys(await this.map(KEYS.relays, relayEntrySchema));

    const found = await Promise.all(
      keys.map(async (key) => ({ key, parsed: relaySchema.safeParse(await this.get(KEYS.relay(key))) })),
    );

    return found
      .flatMap(({ key, parsed }) => (parsed.success ? [{ ...parsed.data, key }] : []))
      .filter((r) => now - Date.parse(r.updated) < RELAY_STALE_MS)
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }

  /** Every faction (and `core`) that has at least one release. */
  async releasedFactions(): Promise<string[]> {
    return Object.keys(await this.map(KEYS.index, indexEntrySchema)).sort();
  }

  /** The files of the newest trusted release of every released faction, core included, for `Library.fromFiles`. */
  async latestFiles(): Promise<RulesFile[]> {
    return (await this.latestReleases()).files;
  }

  /**
   * The newest trusted release of every released faction (core included): its files and what the release is.
   * Releases listed in `have` (same hash) are given without files, as nothing needs downloading for them. Factions
   * that couldn't be read in full are left out, so callers keep what they had for them. `onRelease` gets each faction
   * as soon as it is read.
   */
  async latestReleases(options: LatestOptions = {}): Promise<ReleasedRules> {
    // The index names every faction's newest release: one read, then only the releases that changed.
    const index = Object.entries(await this.map(KEYS.index, indexEntrySchema));
    const known = new Set((options.have ?? []).map((r) => r.hash));

    const load = async ([faction, entry]: [string, IndexEntry]) => {
      const found = await this.completeRelease(faction, entry, known);

      if (found) options.onRelease?.({ files: found.files, releases: [found.info] });

      return found;
    };

    const first = await mapInBatches(index, PARALLEL_FACTIONS, load);
    // Reads that timed out (a slow relay, a phone network) get one more try, one faction at a time.
    const missed = index.filter(([faction]) => !first.some((r) => r?.info.faction === faction));
    const second = await mapInBatches(missed, 1, load);
    const releases = [...first, ...second].filter((r) => r !== null);

    return { files: releases.flatMap((r) => r.files), releases: releases.map((r) => r.info) };
  }

  /**
   * The release an index entry names, with every one of its record files (but those the owner hid), or null when the
   * release or any file couldn't be read, or it isn't trusted: a faction is never given with records missing. A
   * release whose hash is `known` comes without files: the caller has them.
   */
  private async completeRelease(
    faction: string,
    entry: IndexEntry,
    known: Set<string>,
  ): Promise<{ info: ReleaseInfo; files: RulesFile[] } | null> {
    const { hash } = entry;

    if (known.has(hash)) return { info: { faction, ...entry }, files: [] };

    const [manifest] = await this.manifests([KEYS.release(faction, hash)]);

    if (!manifest) return null;

    const { version, date, notes, records } = manifest;
    const info: ReleaseInfo = { faction, version, date, hash, notes, records: Object.keys(records).length };
    const files = await this.releaseFiles(faction, hash);
    // Records the owner hid are left out on purpose; every other one must have arrived.
    const hidden = (await this.roles.hidden()).blobs;
    const expected = Object.values(records).filter((blob) => !hidden.includes(blob)).length;

    return files.length === expected ? { info, files } : null;
  }

  /** Publishes every record of a faction (or `core`) folder and releases them. Maintainers of that faction only. */
  async publishFolder(faction: string, files: { name: string; source: string }[], version: string, notes = '') {
    const heads: Record<string, { blob: string }> = {};

    for (const { name, source } of files) {
      const parsed = parseRecord(source, `${faction}/${name}`, name.replace(/\.md$/, ''));

      if (!parsed.ok) throw new Error(`${faction}/${name}: ${parsed.errors.join('; ')}`);

      const id = parsed.value.kind === 'faction' ? faction : parsed.value.id;

      heads[`${parsed.value.kind}/${id}`] = { blob: await this.putBlob(source) };
    }

    // One change set for the whole folder, holding only the records whose text changed.
    await this.setEntries(KEYS.heads(faction), heads);

    return this.release(faction, version, notes);
  }

  /** A release's records as files for `Library.fromFiles`. Records whose text can't be found are left out. */
  async releaseFiles(faction: string, hash: string): Promise<RulesFile[]> {
    const manifest = manifestSchema.safeParse(await this.get(KEYS.release(faction, hash)));

    if (!manifest.success) return [];

    const files = await Promise.all(
      Object.entries(manifest.data.records).map(async ([ref, blob]) => {
        const [kind, id] = ref.split('/');
        const source = await this.getBlob(blob);
        return source === null ? null : { path: recordFile(faction, kind, id), source };
      }),
    );

    return files.filter((f): f is RulesFile => f !== null);
  }

  /** Owner only: takes down keys and record texts. */
  async hide(keys: string[], blobs: string[], reason: string) {
    await this.put(KEYS.hidden, { keys, blobs, reason });
    this.roles.clear();
  }
}
