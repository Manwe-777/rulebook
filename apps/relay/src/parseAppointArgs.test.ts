import { npubEncode } from 'tool-db';
import { describe, expect, it } from 'vitest';

import { parseAppointArgs } from './parseAppointArgs';

const KEY = 'a'.repeat(64);

describe('parseAppointArgs', () => {
  it('takes a key (npub or hex) and the factions, with the owner key file in the home folder by default', () => {
    expect(parseAppointArgs([npubEncode(KEY), 'core', 'blood-angels'], '/home/me')).toEqual({
      key: KEY,
      factions: ['core', 'blood-angels'],
      remove: false,
      keyFile: '/home/me/rulebook-owner.ncryptsec',
    });
  });

  it('can remove instead, read the owner key from another file, and take every faction', () => {
    expect(parseAppointArgs(['--remove', KEY, 'all', '--key', '/nas/owner.ncryptsec'])).toEqual({
      key: KEY,
      factions: 'all',
      remove: true,
      keyFile: '/nas/owner.ncryptsec',
    });
  });

  it('says what is missing or wrong', () => {
    expect(parseAppointArgs([KEY])).toHaveProperty('error');
    expect(parseAppointArgs(['npub1nope', 'core'])).toHaveProperty('error');
    expect(parseAppointArgs([KEY, 'Blood Angels'])).toHaveProperty('error');
  });
});
