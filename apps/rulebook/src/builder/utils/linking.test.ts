import { describe, expect, it } from 'vitest';

import { LINK_CODE_ALPHABET } from '../constants';
import { formatLinkCode } from './formatLinkCode';
import { linkCode } from './linkCode';
import { linkFromHash } from './linkFromHash';
import { linkUrl } from './linkUrl';
import { normalizeLinkCode } from './normalizeLinkCode';
import { qrPath } from './qrPath';

describe('device link codes', () => {
  it('a code has six easy-to-read characters, with no 0, O, 1, I or L', () => {
    const code = linkCode((n) => new Uint8Array(n).map((_, i) => i * 7));

    expect(code).toHaveLength(6);
    expect([...code].every((c) => LINK_CODE_ALPHABET.includes(c))).toBe(true);
    expect(code).not.toMatch(/[01OIL]/);
  });

  it('a code typed in lower case, with a dash or spaces, reads as the code shown', () => {
    expect(normalizeLinkCode(' k7q-mrb ')).toBe('K7QMRB');
    expect(formatLinkCode('K7QMRB')).toBe('K7Q-MRB');
  });
});

describe('device link addresses', () => {
  it('the link carries the protected key after #, and reads back from the hash', () => {
    const url = linkUrl('https://example.org/rulebook/builder/#old', 'ncryptsec1abc');

    expect(url).toBe('https://example.org/rulebook/builder/#link=ncryptsec1abc');
    expect(linkFromHash(new URL(url).hash)).toBe('ncryptsec1abc');
  });

  it('a hash without a link, or with something else in it, gives none', () => {
    expect(linkFromHash('')).toBeNull();
    expect(linkFromHash('#link=nsec1abc')).toBeNull();
  });

  it('the QR for a link is a square path that fits its own size', () => {
    const { size, d } = qrPath('https://example.org/#link=ncryptsec1abc');

    expect(size).toBeGreaterThan(20);
    expect(d.startsWith('M')).toBe(true);

    expect(Math.max(...[...d.matchAll(/M(\d+) (\d+)/g)].flatMap((m) => [Number(m[1]), Number(m[2])]))).toBeLessThan(
      size,
    );
  });
});
