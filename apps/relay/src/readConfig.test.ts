import { npubEncode } from 'tool-db';
import { describe, expect, it } from 'vitest';

import { readConfig } from './readConfig';

const OWNER = 'a'.repeat(64);

describe('readConfig', () => {
  it('needs no settings at all: without an owner key the relay is an open store', () => {
    expect(readConfig({})).toEqual({
      owner: null,
      port: 8080,
      host: '0.0.0.0',
      dataDir: './data',
      secretKey: undefined,
    });
  });

  it('an empty or blank owner key also means an open store', () => {
    expect(readConfig({ RULEBOOK_OWNER: '  ' })).toMatchObject({ owner: null });
  });

  it('accepts the owner key as an npub and stores it as hex', () => {
    expect(readConfig({ RULEBOOK_OWNER: npubEncode(OWNER) })).toMatchObject({ owner: OWNER });
  });

  it('rejects an npub with a broken checksum', () => {
    const npub = npubEncode(OWNER);
    const broken = `${npub.slice(0, -1)}${npub.endsWith('q') ? 'p' : 'q'}`;

    expect(readConfig({ RULEBOOK_OWNER: broken })).toHaveProperty('errors');
  });

  it('reads every setting', () => {
    const env = {
      RULEBOOK_OWNER: OWNER,
      PORT: '9000',
      HOST: '127.0.0.1',
      DATA_DIR: '/srv/data',
      RELAY_SECRET_KEY: 'b'.repeat(64),
    };

    expect(readConfig(env)).toMatchObject({
      port: 9000,
      host: '127.0.0.1',
      dataDir: '/srv/data',
      secretKey: 'b'.repeat(64),
    });
  });

  it('names every bad setting instead of starting', () => {
    const result = readConfig({ RULEBOOK_OWNER: 'npub1xyz', PORT: '99999', RELAY_SECRET_KEY: 'short' });

    expect('errors' in result && result.errors).toHaveLength(3);
  });
});
