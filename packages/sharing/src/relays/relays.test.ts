import { describe, expect, it } from 'vitest';

import { RELAY_MAX_FAILURES } from '../constants';
import type { RelayAnnouncement } from '../schemas';
import { KnownRelays } from './KnownRelays';
import { pingRelay } from './pingRelay';
import { refreshKnownRelays } from './refreshKnownRelays';

const announced = (...urls: string[]): RelayAnnouncement[] =>
  urls.map((url, i) => ({ url, name: '', updated: '2026-11-19T00:00:00Z', key: String(i).repeat(64) }));

describe('KnownRelays', () => {
  it('adds announced relays once and keeps their record', () => {
    const known = KnownRelays.empty().add(['wss://a']).record('wss://a', true, 5).add(['wss://a', 'wss://b']);

    expect(known.all).toEqual([
      { url: 'wss://a', failures: 0, lastOk: 5 },
      { url: 'wss://b', failures: 0, lastOk: null },
    ]);
  });

  it('drops a relay after too many failed checks in a row; one answer resets the count', () => {
    let known = KnownRelays.empty().add(['wss://a']);

    for (let i = 0; i < RELAY_MAX_FAILURES - 1; i++) known = known.record('wss://a', false, i);
    known = known.record('wss://a', true, 10);
    for (let i = 0; i < RELAY_MAX_FAILURES - 1; i++) known = known.record('wss://a', false, i);

    expect(known.urls).toEqual(['wss://a']);
    expect(known.record('wss://a', false, 20).urls).toEqual([]);
  });

  it('a broken save starts empty, and bad entries are left out', () => {
    expect(KnownRelays.fromSave('nonsense').urls).toEqual([]);
    expect(KnownRelays.fromSave([{ url: 'wss://a', failures: 0, lastOk: null }, { url: 5 }]).urls).toEqual(['wss://a']);
  });
});

describe('refreshKnownRelays', () => {
  it('checks every relay, keeps the ones that answer and leaves the fixed ones alone', async () => {
    const down = new Set(['wss://down']);
    const ping = async (url: string) => (down.has(url) ? null : 10);
    let known = KnownRelays.empty();

    for (let i = 0; i < RELAY_MAX_FAILURES; i++) {
      known = await refreshKnownRelays(known, announced('wss://up', 'wss://down', 'wss://fixed'), {
        skip: ['wss://fixed'],
        now: i,
        ping,
      });
    }

    expect(known.urls).toEqual(['wss://up']);
  });
});

describe('pingRelay', () => {
  it('measures how long a relay takes to accept a connection, or gives up', async () => {
    const socket = () => ({
      onopen: null as (() => void) | null,
      onerror: null as (() => void) | null,
      close: () => {},
    });

    const opening = socket();
    const silent = socket();

    const opened = pingRelay('wss://a', 1000, () => {
      setTimeout(() => opening.onopen?.(), 5);

      return opening;
    });

    expect(await opened).toEqual(expect.any(Number));
    expect(await pingRelay('wss://b', 20, () => silent)).toBeNull();

    expect(
      await pingRelay('bad', 20, () => {
        throw new Error('bad url');
      }),
    ).toBeNull();
  });
});
