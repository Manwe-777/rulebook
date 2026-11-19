import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Library } from '@rulebook/rules';
import { generateSecretKey, getPublicKey, ToolDb } from 'tool-db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { KEYS, TOPIC } from './constants';
import { RulebookRelay } from './relay/RulebookRelay';
import { RulebookClient } from './RulebookClient';

const CONTENT = join(import.meta.dirname, '../../rules/content');
const FACTION = 'demo-host';

const demo = (folder: string) =>
  readdirSync(join(CONTENT, folder)).map((file) => ({
    file,
    text: readFileSync(join(CONTENT, folder, file), 'utf8'),
  }));

const kindOf = (text: string) => /^kind: (\w+)$/m.exec(text)![1] as 'faction' | 'unit' | 'detachment' | 'muster';

let relay: RulebookRelay;

/** Writes reach other clients through the relay a moment later: retry a read until it passes, for up to 3 seconds. */
async function eventually<T>(read: () => Promise<T>, check: (value: T) => boolean): Promise<T> {
  const until = Date.now() + 3000;
  let value = await read();

  while (!check(value) && Date.now() < until) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    value = await read();
  }

  return value;
}

const dbs: ToolDb[] = [];

async function connect(): Promise<ToolDb> {
  const db = new ToolDb({ relays: [relay.url], topic: TOPIC });

  await db.ready;

  if (!db.isConnected) await new Promise<void>((resolve) => (db.onConnect = () => resolve()));

  dbs.push(db);

  return db;
}

let owner: RulebookClient;
let maintainer: RulebookClient;
let contributor: RulebookClient;
let stranger: RulebookClient;
/**
 * Makes the writes that must be refused. tool-db keeps a client's own writes locally even when they break the write
 * rules, so they would only fool that client; a separate client keeps the stranger's view clean.
 */
let intruder: RulebookClient;
let intruderDb: ToolDb;
/** A client with no write rules, to see what the relay itself kept. */
let raw: ToolDb;

beforeAll(async () => {
  const ownerSecret = generateSecretKey();
  const ownerKey = getPublicKey(ownerSecret);

  relay = new RulebookRelay({ owner: ownerKey, roleCacheMs: 0 });
  await relay.start();

  const ownerDb = await connect();

  await ownerDb.keysSignIn(ownerSecret);

  owner = new RulebookClient(ownerDb, ownerKey, 0);
  maintainer = new RulebookClient(await connect(), ownerKey, 0);
  contributor = new RulebookClient(await connect(), ownerKey, 0);
  stranger = new RulebookClient(await connect(), ownerKey, 0);
  intruderDb = await connect();
  intruder = new RulebookClient(intruderDb, ownerKey, 0);
  raw = await connect();

  await owner.setMaintainers(FACTION, [maintainer.me]);
  await maintainer.setContributors(FACTION, [contributor.me]);
});

afterAll(async () => {
  await Promise.all(dbs.map((db) => db.close()));
  await relay.close();
});

describe('roles', () => {
  it('the owner appoints maintainers, and maintainers appoint contributors', async () => {
    expect(await stranger.roles.maintainers(FACTION)).toEqual([maintainer.me]);
    expect(await stranger.roles.contributors(FACTION)).toEqual([contributor.me]);
    expect(await stranger.roles.isContributor(FACTION, maintainer.me)).toBe(true);
  });

  it("nobody else can change the role lists, and the relay doesn't keep their attempts", async () => {
    await intruder.setMaintainers(FACTION, [intruder.me]).catch(() => undefined);
    await intruder.setContributors(FACTION, [intruder.me]).catch(() => undefined);

    expect(await maintainer.roles.maintainers(FACTION)).toEqual([maintainer.me]);
    expect(await maintainer.roles.contributors(FACTION)).toEqual([contributor.me]);

    const kept = await raw.getData(KEYS.maintainers(FACTION));

    expect(kept).toEqual({ keys: [maintainer.me] });
  });

  it('anyone can ask to contribute, and maintainers see open requests', async () => {
    await stranger.requestAccess(FACTION, 'I play this army every week.');

    expect(
      await eventually(
        () => maintainer.requests(FACTION),
        (r) => r.length > 0,
      ),
    ).toEqual([{ author: stranger.me, message: 'I play this army every week.' }]);
  });
});

describe('proposals and reviews', () => {
  const unit = demo(FACTION).find((f) => f.file === 'field-captain.md')!.text;

  it('a contributor proposes a change, and a maintainer accepts it as the new version', async () => {
    const key = await contributor.propose(FACTION, {
      kind: 'unit',
      id: 'field-captain',
      text: unit,
      note: 'First version',
    });

    const [proposal] = (
      await eventually(
        () => maintainer.proposals(FACTION),
        (list) => list.some((p) => p.key === key),
      )
    ).filter((p) => p.key === key);

    expect(proposal).toMatchObject({
      kind: 'unit',
      id: 'field-captain',
      author: contributor.me,
      note: 'First version',
    });

    await maintainer.accept(FACTION, proposal, 'Thanks');

    expect(
      await eventually(
        () => stranger.head(FACTION, 'unit', 'field-captain'),
        (v) => v === proposal.blob,
      ),
    ).toBe(proposal.blob);

    expect(
      await eventually(
        () => stranger.getBlob(proposal.blob),
        (v) => v === unit,
      ),
    ).toBe(unit);

    const reviewed = await eventually(
      () => stranger.proposals(FACTION),
      (list) => list.some((p) => p.key === key && p.review),
    );

    expect(reviewed.find((p) => p.key === key)?.review).toEqual({
      status: 'accepted',
      comment: 'Thanks',
    });
  });

  it('a later proposal remembers which version it changes', async () => {
    const base = await maintainer.head(FACTION, 'unit', 'field-captain');

    const key = await contributor.propose(FACTION, {
      kind: 'unit',
      id: 'field-captain',
      text: unit.replace('70', '75'),
    });

    const proposal = (
      await eventually(
        () => maintainer.proposals(FACTION),
        (list) => list.some((p) => p.key === key),
      )
    ).find((p) => p.key === key)!;

    expect(proposal.base).toBe(base);

    await maintainer.reject(FACTION, proposal, 'Points are 70.');

    expect(
      await eventually(
        () => stranger.head(FACTION, 'unit', 'field-captain'),
        (v) => v === base,
      ),
    ).toBe(base);
  });

  it("proposals from people who aren't contributors are ignored", async () => {
    const key = await stranger.propose(FACTION, { kind: 'unit', id: 'field-captain', text: unit });

    expect((await maintainer.proposals(FACTION)).map((p) => p.key)).not.toContain(key);
  });

  it("only maintainers can set a record's version directly", async () => {
    const before = await maintainer.head(FACTION, 'unit', 'field-captain');

    await intruder.edit(FACTION, 'unit', 'field-captain', unit.replace('70', '5')).catch(() => undefined);
    await contributor.edit(FACTION, 'unit', 'field-captain', unit.replace('70', '6')).catch(() => undefined);

    expect(
      await eventually(
        () => maintainer.head(FACTION, 'unit', 'field-captain'),
        (v) => v === before,
      ),
    ).toBe(before);
  });

  it('record texts are only accepted under their own hash, and only when they parse', async () => {
    await intruderDb.putData(KEYS.blob('0'.repeat(64)), unit).catch(() => undefined);
    await intruderDb.putData(KEYS.blob('1'.repeat(64)), 'not a record').catch(() => undefined);

    expect(await maintainer.getBlob('0'.repeat(64))).toBeNull();
    expect(await raw.getData(KEYS.blob('0'.repeat(64)))).toBeNull();
  });
});

describe('releases', () => {
  let hash: string;

  beforeAll(async () => {
    await maintainer.publishFolder(
      FACTION,
      demo(FACTION).map(({ file, text }) => ({ name: file, source: text })),
      'draft',
    );

    await owner.publishFolder(
      'core',
      demo('core').map(({ file, text }) => ({ name: file, source: text })),
      'draft',
    );

    hash = await maintainer.release(FACTION, '2026-11', 'First release');
  });

  it('a release turns back into the same library as the files it came from', async () => {
    const count = demo(FACTION).length;

    const files = await eventually(
      () => stranger.releaseFiles(FACTION, hash),
      (f) => f.length === count,
    );

    const coreHash = await owner.release('core', '2026-11');

    const core = await eventually(
      () => stranger.releaseFiles('core', coreHash),
      (f) => f.length === 1,
    );

    const library = Library.fromFiles([...files, ...core]);

    expect(library.errors).toEqual([]);
    expect(library.faction(FACTION)!.units).toHaveLength(demo(FACTION).filter((f) => kindOf(f.text) === 'unit').length);
    expect(library.muster?.id).toBe('matched-play');
  });

  it('readers find every released faction and load the newest release of each', async () => {
    await owner.release('core', 'latest');

    const factions = await eventually(
      () => stranger.releasedFactions(),
      (f) => f.length === 2,
    );

    const library = Library.fromFiles(await stranger.latestFiles());

    expect(factions).toEqual(['core', FACTION]);
    expect(library.errors).toEqual([]);
    expect(library.faction(FACTION)?.detachments.length).toBeGreaterThan(0);
    expect(library.muster).toBeDefined();
  });

  it('readers list trusted releases, newest first', async () => {
    const releases = await eventually(
      () => stranger.releases(FACTION),
      (r) => r.length === 2,
    );

    expect(releases.map((r) => r.version)).toEqual(['2026-11', 'draft']);
    expect(releases[0].hash).toBe(hash);
  });

  it("a stranger's release is not trusted", async () => {
    await intruder.release(FACTION, 'fake').catch(() => undefined);

    expect((await maintainer.releases(FACTION)).map((r) => r.version)).toEqual(['2026-11', 'draft']);
  });

  it('a release stays trusted after its signer is removed only if a current maintainer signed it too', async () => {
    const lone = await maintainer.release(FACTION, 'lone');

    await owner.cosign(FACTION, hash);
    await owner.setMaintainers(FACTION, []);

    const versions = (
      await eventually(
        () => stranger.releases(FACTION),
        (r) => !r.some((x) => x.hash === lone),
      )
    ).map((r) => r.hash);

    expect(versions).toContain(hash);
    expect(versions).not.toContain(lone);

    await owner.setMaintainers(FACTION, [maintainer.me]);
  });
});

describe('hiding', () => {
  it('hidden keys and record texts stop being served', async () => {
    const blob = (await maintainer.head(FACTION, 'unit', 'veteran-squad'))!;

    await owner.hide([KEYS.head(FACTION, 'unit', 'line-troopers')], [blob], 'Takedown request');

    expect(
      await eventually(
        () => stranger.head(FACTION, 'unit', 'line-troopers'),
        (v) => v === null,
      ),
    ).toBeNull();

    expect(
      await eventually(
        () => stranger.getBlob(blob),
        (v) => v === null,
      ),
    ).toBeNull();

    expect(await stranger.head(FACTION, 'unit', 'field-captain')).not.toBeNull();
  });

  it('only the owner can hide content', async () => {
    await intruder.hide([KEYS.head(FACTION, 'unit', 'field-captain')], [], 'mine').catch(() => undefined);

    expect(await maintainer.head(FACTION, 'unit', 'field-captain')).not.toBeNull();
  });
});
