import { generateSecretKey, getPublicKey, ToolDb } from 'tool-db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { TOPIC } from '../constants';
import { RulebookRelay } from '../relay/RulebookRelay';
import { SyncedLists } from './SyncedLists';

let relay: RulebookRelay;
const dbs: ToolDb[] = [];

async function device(secret: string): Promise<ToolDb> {
  const db = new ToolDb({ relays: [relay.url], topic: TOPIC });

  await db.ready;
  if (!db.isConnected) await new Promise<void>((resolve) => (db.onConnect = () => resolve()));
  await db.keysSignIn(secret);
  dbs.push(db);

  return db;
}

/** Retries a read until it passes, for up to 3 seconds: writes reach other clients through the relay a moment later. */
async function eventually<T>(read: () => Promise<T>, check: (value: T) => boolean): Promise<T> {
  const until = Date.now() + 3000;
  let value = await read();

  while (!check(value) && Date.now() < until) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    value = await read();
  }

  return value;
}

const secret = generateSecretKey();

beforeAll(async () => {
  relay = new RulebookRelay({ owner: getPublicKey(generateSecretKey()), roleCacheMs: 0 });
  await relay.start();
});

afterAll(async () => {
  await Promise.all(dbs.map((db) => db.close()));
  await relay.close();
});

describe('SyncedLists', () => {
  it('a list saved on one device is read back on another device with the same key', async () => {
    const pc = new SyncedLists(await device(secret), secret);
    const phone = new SyncedLists(await device(secret), secret);
    const list = { name: 'Shield Wall 2000', units: [] };

    await pc.put({ id: 'army-1', updatedAt: 10, list });

    const seen = await eventually(
      () => phone.all(),
      (all) => all.some((e) => e.id === 'army-1'),
    );

    expect(seen).toEqual([{ id: 'army-1', updatedAt: 10, list }]);
  });

  it('a deletion is synced as an entry without a list, replacing the old one', async () => {
    const pc = new SyncedLists(await device(secret), secret);
    const phone = new SyncedLists(await device(secret), secret);

    await pc.put({ id: 'army-2', updatedAt: 10, list: { name: 'Gone soon' } });
    await pc.put({ id: 'army-2', updatedAt: 20, list: null });

    const seen = await eventually(
      () => phone.all(),
      (all) => all.some((e) => e.id === 'army-2' && e.list === null),
    );

    expect(seen.find((e) => e.id === 'army-2')).toEqual({ id: 'army-2', updatedAt: 20, list: null });
  });

  it('another key sees neither the lists nor their names, only encrypted text', async () => {
    const pc = new SyncedLists(await device(secret), secret);

    await pc.put({ id: 'army-3', updatedAt: 10, list: { name: 'Secret plans' } });

    const otherSecret = generateSecretKey();
    const stranger = new SyncedLists(await device(otherSecret), otherSecret);
    const raw = await device(otherSecret);
    const key = `:${getPublicKey(secret)}.list/army-3`;

    const value = await eventually(
      () => raw.getData(key, false, 3000),
      (v) => v !== null,
    );

    expect(JSON.stringify(value)).not.toContain('Secret plans');
    expect(await stranger.all()).toEqual([]);
  });
});
