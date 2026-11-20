import { describe, expect, it } from 'vitest';

import { parseCount } from './parseCount';

describe('parseCount', () => {
  it('an emptied field gives no number yet, so the old count can be replaced', () => {
    expect(parseCount('', 0, 4)).toBeNull();
  });

  it('typed counts stay within the limits, and stray characters are ignored', () => {
    expect(parseCount('3', 0, 4)).toBe(3);
    expect(parseCount('12', 0, 4)).toBe(4);
    expect(parseCount('-2', 1, 4)).toBe(2);
    expect(parseCount('0', 1, 4)).toBe(1);
    expect(parseCount('2a', 0, 4)).toBe(2);
  });
});
