import { describe, expect, it } from 'vitest';

import { MIN_TEXT_CONTRAST } from '../constants';
import { contrastWithWhite, factionTint } from './factionTint';

const bar = (color: string) => (factionTint(color) as Record<string, string>)['--color-bar'];

describe('factionTint', () => {
  it('uses a dark faction colour as it is', () => {
    expect(bar('#1a3a8f')).toBe('#1a3a8f');
  });

  it('darkens light colours until white text on them is readable, keeping their hue', () => {
    for (const light of ['#f2c200', '#9be36b', '#ffffff', '#ff7a7a']) {
      const tinted = bar(light);

      expect(contrastWithWhite(tinted)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }

    const yellow = bar('#f2c200');

    expect(parseInt(yellow.slice(1, 3), 16)).toBeGreaterThan(parseInt(yellow.slice(5, 7), 16)); // still more red than blue
  });

  it('the pressed shade is darker than the bar', () => {
    const tint = factionTint('#8f1d1d') as Record<string, string>;

    expect(contrastWithWhite(tint['--color-bar-dark'])).toBeGreaterThan(contrastWithWhite(tint['--color-bar']));
  });

  it('no colour, or one that isn’t a hex colour, keeps the default accent', () => {
    expect(factionTint(undefined)).toEqual({});
    expect(factionTint('red')).toEqual({});
  });
});
