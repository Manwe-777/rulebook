import { parseRecord, type RulesFile } from '@rulebook/rules';
import type { ToolDb } from 'tool-db';

import { KEYS, PARALLEL_FACTIONS, READ_TIMEOUT_MS, RELAY_STALE_MS } from './constants';
import { parseKey } from './rules/parseKey';
import { Roles } from './rules/Roles';
import { registerWriteRules } from './rules/writeRules';
import {
  headSchema,
  type Manifest,
  manifestSchema,
  type Proposal,
  proposalSchema,
  type RelayAnnouncement,
  relaySchema,
  type ReleasedRules,
  type ReleaseInfo,
  requestSchema,
  reviewSchema,
} from './schemas';
import { canonicalJson } from './utils/canonicalJson';
import { mapInBatches } from './utils/mapInBatches';
import { sha256Hex } from './utils/sha256Hex';

type Kind = Proposal['kind'];

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
    await this.put(KEYS.request(faction), { message }, true);
  }

  /** Open contributor requests for a faction, from people who are not contributors yet. */
  async requests(faction: string): Promise<{ author: string; message: string }[]> {
    const keys = (await this.db.queryKeys(':', false, READ_TIMEOUT_MS)).filter(
      (k) => parseKey(k).parts.join('/') === KEYS.request(faction),
    );

    const found = await Promise.all(
      keys.map(async (key) => ({ author: parseKey(key).owner!, value: requestSchema.safeParse(await this.get(key)) })),
    );

    const open = await Promise.all(
      found.map(async (r) => r.value.success && !(await this.roles.isContributor(faction, r.author))),
    );

    return found.filter((_, i) => open[i]).map((r) => ({ author: r.author, message: r.value.data!.message }));
  }

  /** Proposes a new version of a record. Returns the proposal's key. */
  async propose(faction: string, change: { kind: Kind; id: string; text: string; note?: string }): Promise<string> {
    const head = await this.head(faction, change.kind, change.id);
    const blob = await this.putBlob(change.text);
    const n = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const proposal = { kind: change.kind, id: change.id, base: head ?? undefined, blob, note: change.note ?? '' };

    await this.put(KEYS.proposal(faction, n), proposal, true);

    return `:${this.me}.${KEYS.proposal(faction, n)}`;
  }

  /** Every proposal for a faction from its contributors, with its review if it has one. */
  async proposals(faction: string): Promise<ProposalEntry[]> {
    const prefix = `proposal/${faction}/`;

    const keys = (await this.db.queryKeys(':', false, READ_TIMEOUT_MS)).filter((k) =>
      parseKey(k).parts.join('/').startsWith(prefix),
    );

    const entries = await Promise.all(keys.map((key) => this.proposal(faction, key)));

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
    await this.put(KEYS.head(faction, proposal.kind, proposal.id), { blob: proposal.blob, proposal: proposal.key });
    await this.put(this.reviewKey(faction, proposal.key), { status: 'accepted', comment });
  }

  /** Maintainers only. */
  async reject(faction: string, proposal: ProposalEntry, comment: string) {
    await this.put(this.reviewKey(faction, proposal.key), { status: 'rejected', comment });
  }

  /** Maintainers only: changes a record without a proposal. */
  async edit(faction: string, kind: Kind, id: string, text: string) {
    await this.put(KEYS.head(faction, kind, id), { blob: await this.putBlob(text) });
  }

  /** Hash of a record's accepted text, or null. */
  async head(faction: string, kind: Kind, id: string): Promise<string | null> {
    const parsed = headSchema.safeParse(await this.get(KEYS.head(faction, kind, id)));

    return parsed.success ? parsed.data.blob : null;
  }

  /** Every accepted record of a faction, as `kind/id` to the hash of its text. */
  async heads(faction: string): Promise<Record<string, string>> {
    const keys = await this.db.queryKeys(KEYS.headPrefix(faction), false, READ_TIMEOUT_MS);
    const records: Record<string, string> = {};

    for (const key of keys) {
      const [, , kind, id] = parseKey(key).parts;
      const parsed = headSchema.safeParse(await this.get(key));

      if (parsed.success) records[`${kind}/${id}`] = parsed.data.blob;
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

    return hash;
  }

  /** Signs an existing release again, so it stays trusted when its first signer stops being a maintainer. */
  async cosign(faction: string, hash: string) {
    const manifest = await this.get(KEYS.release(faction, hash));

    if (manifest) await this.put(KEYS.release(faction, hash), manifest);
  }

  /** Every trusted release of a faction, newest first. */
  async releases(faction: string): Promise<(Manifest & { hash: string })[]> {
    return this.manifests(await this.db.queryKeys(KEYS.releasePrefix(faction), false, READ_TIMEOUT_MS));
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
    await this.put(KEYS.relay(this.me), { url, name, updated: now.toISOString() });
  }

  /** Relays that announced themselves recently, newest first. Older announcements are left out. */
  async relays(now = Date.now()): Promise<RelayAnnouncement[]> {
    const keys = await this.db.queryKeys(KEYS.relayPrefix, false, READ_TIMEOUT_MS);

    const found = await Promise.all(
      keys.map(async (key) => ({ key: parseKey(key).parts[1], parsed: relaySchema.safeParse(await this.get(key)) })),
    );

    return found
      .flatMap(({ key, parsed }) => (parsed.success ? [{ ...parsed.data, key }] : []))
      .filter((r) => now - Date.parse(r.updated) < RELAY_STALE_MS)
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }

  /** Every faction (and `core`) that has at least one release. */
  async releasedFactions(): Promise<string[]> {
    const keys = await this.db.queryKeys('release/', false, READ_TIMEOUT_MS);

    return [...new Set(keys.map((k) => parseKey(k).parts[1]))].sort();
  }

  /** The files of the newest trusted release of every released faction, core included, for `Library.fromFiles`. */
  async latestFiles(): Promise<RulesFile[]> {
    return (await this.latestReleases()).files;
  }

  /**
   * The newest trusted release of every released faction (core included): its files and what the release is.
   * Factions that couldn't be read in full are left out, so callers keep what they had for them.
   */
  async latestReleases(): Promise<ReleasedRules> {
    // One search finds every faction's release keys; searching per faction is slow and times out when run together.
    const keys = await this.db.queryKeys('release/', false, READ_TIMEOUT_MS);
    const byFaction = new Map<string, string[]>();

    for (const key of keys) {
      const faction = parseKey(key).parts[1];

      byFaction.set(faction, [...(byFaction.get(faction) ?? []), key]);
    }

    const load = ([faction, factionKeys]: [string, string[]]) => this.completeRelease(faction, factionKeys);
    const first = await mapInBatches([...byFaction], PARALLEL_FACTIONS, load);
    // Reads that timed out (a slow relay, a phone network) get one more try, one faction at a time.
    const missed = [...byFaction].filter(([faction]) => !first.some((r) => r?.info.faction === faction));
    const second = await mapInBatches(missed, 1, load);
    const releases = [...first, ...second].filter((r) => r !== null);

    return { files: releases.flatMap((r) => r.files), releases: releases.map((r) => r.info) };
  }

  /**
   * The newest trusted release among these keys with every one of its record files (but those the owner hid), or null
   * when the release or any file couldn't be read: a faction is never given with records missing.
   */
  private async completeRelease(
    faction: string,
    keys: string[],
  ): Promise<{ info: ReleaseInfo; files: RulesFile[] } | null> {
    const [newest] = await this.manifests(keys);

    if (!newest) return null;

    const { version, date, hash, notes, records } = newest;
    const info: ReleaseInfo = { faction, version, date, hash, notes, records: Object.keys(records).length };
    const files = await this.releaseFiles(faction, hash);
    // Records the owner hid are left out on purpose; every other one must have arrived.
    const hidden = (await this.roles.hidden()).blobs;
    const expected = Object.values(records).filter((blob) => !hidden.includes(blob)).length;

    return files.length === expected ? { info, files } : null;
  }

  /** Publishes every record of a faction (or `core`) folder and releases them. Maintainers of that faction only. */
  async publishFolder(faction: string, files: { name: string; source: string }[], version: string, notes = '') {
    for (const { name, source } of files) {
      const parsed = parseRecord(source, `${faction}/${name}`, name.replace(/\.md$/, ''));

      if (!parsed.ok) throw new Error(`${faction}/${name}: ${parsed.errors.join('; ')}`);

      const id = parsed.value.kind === 'faction' ? faction : parsed.value.id;

      await this.edit(faction, parsed.value.kind, id, source);
    }

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
