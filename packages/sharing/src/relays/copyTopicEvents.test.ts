import { generateSecretKey, getPublicKey, ToolDb } from 'tool-db';
import { afterAll, describe, expect, it } from 'vitest';

import { KEYS, TOPIC } from '../constants';
import { RulebookRelay } from '../relay/RulebookRelay';
import { RulebookClient } from '../RulebookClient';
import { copyTopicEvents } from './copyTopicEvents';
import { pushTopicEvents } from './pushTopicEvents';

const relays: RulebookRelay[] = [];
const dbs: ToolDb[] = [];

async function startRelay(owner: string | null) {
  const relay = new RulebookRelay({ owner, roleCacheMs: 0 });

  await relay.start();
  relays.push(relay);

  return relay;
}

async function client(url: string, secret?: string) {
  const db = new ToolDb({ relays: [url], topic: TOPIC });

  await db.ready;
  if (!db.isConnected) await new Promise<void>((resolve) => (db.onConnect = () => resolve()));
  if (secret) await db.keysSignIn(secret);
  dbs.push(db);

  return db;
}

afterAll(async () => {
  await Promise.all(dbs.map((db) => db.close()));
  await Promise.all(relays.map((r) => r.close()));
});

describe('copyTopicEvents', () => {
  it('a new relay gets what another one stored, still signed by the original writers', async () => {
    const ownerSecret = generateSecretKey();
    const owner = getPublicKey(ownerSecret);
    const old = await startRelay(owner);
    const fresh = await startRelay(owner);
    const writer = new RulebookClient(await client(old.url, ownerSecret), owner, 0);

    await writer.setMaintainers('demo-host', ['a'.repeat(64)]);
    await writer.announceRelay('wss://old.example');

    const copied = await copyTopicEvents([old.url], fresh.url, { timeoutMs: 3000 });
    const reader = new RulebookClient(await client(fresh.url), owner, 0);

    expect(copied.accepted).toBe(copied.found);
    expect(copied.found).toBeGreaterThanOrEqual(2);
    expect(await reader.roles.maintainers('demo-host')).toEqual(['a'.repeat(64)]);
    expect((await reader.relays()).map((r) => r.url)).toEqual(['wss://old.example']);
  });

  it('the receiving relay still applies its write rules to what it is given', async () => {
    const owner = getPublicKey(generateSecretKey());
    const open = await startRelay(null);
    const strict = await startRelay(owner);
    const stranger = await client(open.url, generateSecretKey());

    // An open relay keeps a role list nobody may write; the strict one refuses it.
    await stranger.putData(KEYS.maintainers('demo-host'), { keys: ['b'.repeat(64)] });

    const copied = await copyTopicEvents([open.url], strict.url, { timeoutMs: 3000 });

    expect(copied.found).toBeGreaterThanOrEqual(1);
    expect(copied.accepted).toBe(0);
  });

  it('nothing to copy from is nothing copied', async () => {
    expect(await copyTopicEvents([], 'ws://unused')).toEqual({ found: 0, accepted: 0 });
  });
});

describe('pushTopicEvents', () => {
  it('sends another relay what it lacks, and next time only what is new', async () => {
    const ownerSecret = generateSecretKey();
    const owner = getPublicKey(ownerSecret);
    const ours = await startRelay(owner);
    const pub = await startRelay(null);
    const writer = new RulebookClient(await client(ours.url, ownerSecret), owner, 0);

    await writer.setMaintainers('demo-host', ['a'.repeat(64)]);
    await writer.announceRelay('wss://ours.example');

    const first = (await pushTopicEvents(ours.url, [pub.url], { spacingMs: 0, timeoutMs: 3000 }))[pub.url];
    const reader = new RulebookClient(await client(pub.url), owner, 0);

    expect(first.sent).toBeGreaterThanOrEqual(2);
    expect(first.stopped).toBeUndefined();
    expect(await reader.roles.maintainers('demo-host')).toEqual(['a'.repeat(64)]);
    expect((await reader.relays()).map((r) => r.url)).toEqual(['wss://ours.example']);

    await writer.setMaintainers('demo-host', ['b'.repeat(64)]);

    const again = (
      await pushTopicEvents(ours.url, [pub.url], { spacingMs: 0, timeoutMs: 3000, done: { [pub.url]: first.done } })
    )[pub.url];

    expect(again.sent).toBe(1);
    expect(await reader.roles.maintainers('demo-host')).toEqual(['b'.repeat(64)]);
  });
});
