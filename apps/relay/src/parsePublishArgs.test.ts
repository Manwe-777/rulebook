import { describe, expect, it } from 'vitest';

import { parsePublishArgs } from './parsePublishArgs';

describe('parsePublishArgs', () => {
  it('takes a folder and a version, with an optional key file and notes in any order', () => {
    expect(parsePublishArgs(['content', '2026-11'])).toEqual({ folder: 'content', version: '2026-11', notes: '' });

    expect(parsePublishArgs(['--key', '/nas/me.ncryptsec', 'content', '2026-11', '--notes', 'First release'])).toEqual({
      folder: 'content',
      version: '2026-11',
      keyFile: '/nas/me.ncryptsec',
      notes: 'First release',
    });
  });

  it('says what is missing', () => {
    expect(parsePublishArgs(['content'])).toHaveProperty('error');
    expect(parsePublishArgs(['content', '2026-11', '--key'])).toHaveProperty('error');
  });
});
