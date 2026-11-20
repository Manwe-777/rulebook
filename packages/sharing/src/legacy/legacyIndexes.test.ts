import { describe, expect, it } from 'vitest';

import { canonicalJson } from '../utils/canonicalJson';
import { sha256Hex } from '../utils/sha256Hex';
import { legacyIndexes, type LegacyValue } from './legacyIndexes';

const M = 'a'.repeat(64);
const X = 'b'.repeat(64);
const BLOB = 'c'.repeat(64);
const isMaintainer = async (_: string, p: string) => p === M;

async function release(faction: string, version: string, date: string) {
  const value = JSON.parse(canonicalJson({ faction, version, date, records: { 'unit/a': BLOB }, notes: 'n' }));

  return { key: `release/${faction}/${await sha256Hex(canonicalJson(value))}`, value };
}

describe('legacyIndexes', () => {
  it('turns heads, releases, relays, requests and proposals into map entries, pointing the index at the newest release', async () => {
    const old = await release('orks', '1', '2026-01-01');
    const recent = await release('orks', '2', '2026-02-01');

    const values: LegacyValue[] = [
      { key: 'head/orks/unit/boyz', author: M, createdAt: 1, value: { blob: BLOB } },
      { key: old.key, author: M, createdAt: 1, value: old.value },
      { key: recent.key, author: M, createdAt: 2, value: recent.value },
      { key: `relay/${X}`, author: X, createdAt: 1, value: { url: 'wss://r', name: 'R', updated: '2026-01-01' } },
      { key: `:${X}.request/orks`, author: X, createdAt: 1, value: { message: 'hi' } },
      { key: `:${X}.proposal/orks/n1`, author: X, createdAt: 1, value: {} },
    ];

    const maps = await legacyIndexes(values, isMaintainer);

    expect(maps['heads/orks']).toEqual({ 'unit/boyz': { blob: BLOB } });
    expect(Object.keys(maps['releases/orks'])).toHaveLength(2);

    expect(maps.index).toEqual({
      orks: { hash: recent.key.split('/')[2], version: '2', date: '2026-02-01', notes: 'n', records: 1 },
    });

    expect(maps.relays).toEqual({ [X]: { url: 'wss://r', name: 'R' } });
    expect(maps['requests/orks']).toEqual({ [X]: { message: 'hi' } });
    expect(maps['proposals/orks']).toEqual({ [`${X}/n1`]: {} });
  });

  it("leaves out what the old rules wouldn't have trusted, and keeps the newest value of each key", async () => {
    const values: LegacyValue[] = [
      { key: 'head/orks/unit/boyz', author: X, createdAt: 5, value: { blob: BLOB } },
      { key: 'head/orks/unit/nobz', author: M, createdAt: 1, value: { blob: BLOB } },
      { key: 'head/orks/unit/nobz', author: M, createdAt: 2, value: { blob: 'd'.repeat(64) } },
      { key: 'head/orks/unit/nobz', author: X, createdAt: 9, value: { blob: 'e'.repeat(64) } },
      { key: `relay/${M}`, author: X, createdAt: 1, value: { url: 'wss://evil', name: '', updated: 'x' } },
      { key: `:${M}.request/orks`, author: X, createdAt: 1, value: { message: 'forged' } },
    ];

    const maps = await legacyIndexes(values, isMaintainer);

    expect(maps).toEqual({ 'heads/orks': { 'unit/nobz': { blob: 'd'.repeat(64) } } });
  });
});
