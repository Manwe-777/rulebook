import { describe, expect, it } from 'vitest';

import { relayRows } from './relayRows';

const announcement = (url: string, key: string, name = '') => ({ url, key, name, updated: '2026-11-19T10:00:00Z' });

describe('relayRows', () => {
  it("lists the project's relays first, then the announced ones, each once", () => {
    const rows = relayRows(
      ['wss://public.example'],
      [
        announcement('wss://home.example', 'a'.repeat(64), 'Home'),
        announcement('wss://public.example', 'b'.repeat(64)),
      ],
      [{ url: 'wss://home.example', failures: 0, lastOk: 1 }],
      { 'wss://public.example': 40, 'wss://home.example': null },
    );

    expect(rows.map((r) => [r.url, r.source, r.status, r.ping])).toEqual([
      ['wss://public.example', 'project', 'fixed', 40],
      ['wss://home.example', 'announced', 'used', null],
    ]);

    expect(rows[0].key).toBe('b'.repeat(64));
    expect(rows[1].name).toBe('Home');
  });

  it("an announced relay this browser doesn't use (unchecked or dropped) says so", () => {
    expect(relayRows([], [announcement('wss://new.example', 'c'.repeat(64))], [], {})[0]).toMatchObject({
      status: 'unused',
      ping: undefined,
    });
  });
});
