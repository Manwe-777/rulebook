import { npubEncode } from 'tool-db';
import { describe, expect, it } from 'vitest';

import { ownerKeyHex } from './ownerKeyHex';

const HEX = 'a'.repeat(64);

describe('ownerKeyHex', () => {
  it('keeps a hex key and converts an npub, ignoring surrounding spaces', () => {
    expect(ownerKeyHex(HEX)).toBe(HEX);
    expect(ownerKeyHex(` ${npubEncode(HEX)}\n`)).toBe(HEX);
  });

  it('gives an empty key for anything else, including an npub with a broken checksum', () => {
    const npub = npubEncode(HEX);

    expect(ownerKeyHex('')).toBe('');
    expect(ownerKeyHex('A'.repeat(64))).toBe('');
    expect(ownerKeyHex(`${npub.slice(0, -1)}${npub.endsWith('q') ? 'p' : 'q'}`)).toBe('');
  });
});
