import { describe, expect, it } from 'vitest';

import { fromInvocation } from './fromInvocation';
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

describe('fromInvocation', () => {
  it('resolves paths from the folder the command was run in, not the workspace npm runs it from', () => {
    expect(fromInvocation('packages/rules/content', { INIT_CWD: '/repo' })).toBe('/repo/packages/rules/content');
    expect(fromInvocation('/abs/key.ncryptsec', { INIT_CWD: '/repo' })).toBe('/abs/key.ncryptsec');
  });
});
