import { encryptSecretKey, generateSecretKey, nsecEncode } from 'tool-db';
import { afterEach, describe, expect, it } from 'vitest';

import { IDENTITY_KEY } from '../constants';
import { readSecretKey } from './readSecretKey';
import { loadStoredIdentity, saveStoredIdentity } from './storedIdentity';

describe('readSecretKey', () => {
  const secret = generateSecretKey();

  it('reads an nsec or a hex key, ignoring surrounding spaces', async () => {
    expect(await readSecretKey(` ${nsecEncode(secret)} `)).toEqual({ secret });
    expect(await readSecretKey(secret)).toEqual({ secret });
  });

  it('reads a password-protected key with the right password only', async () => {
    const ncryptsec = await encryptSecretKey(secret, 'a long password', 4);

    expect(await readSecretKey(ncryptsec, 'a long password')).toEqual({ secret });
    expect(await readSecretKey(ncryptsec, 'wrong')).toEqual({ error: expect.stringMatching(/Wrong password/) });
    expect(await readSecretKey(ncryptsec)).toEqual({ error: expect.stringMatching(/enter its password/) });
  });

  it('says what to paste when the text is not a key', async () => {
    expect(await readSecretKey('npub1notasecret')).toEqual({ error: expect.stringMatching(/Paste a secret key/) });
  });
});

describe('stored identity', () => {
  afterEach(() => localStorage.clear());

  it('saves and loads each way to sign, and forgets it', () => {
    const browser = { mode: 'browser' as const, secret: 'a'.repeat(64) };

    expect(saveStoredIdentity(browser)).toBe(true);
    expect(loadStoredIdentity()).toEqual(browser);

    saveStoredIdentity({ mode: 'extension' });

    expect(loadStoredIdentity()).toEqual({ mode: 'extension' });

    saveStoredIdentity(null);

    expect(loadStoredIdentity()).toBeNull();
  });

  it('nothing saved, or something unreadable, gives no identity instead of crashing', () => {
    expect(loadStoredIdentity()).toBeNull();

    localStorage.setItem(IDENTITY_KEY, '{broken');

    expect(loadStoredIdentity()).toBeNull();

    localStorage.setItem(IDENTITY_KEY, JSON.stringify({ mode: 'browser', secret: 'short' }));

    expect(loadStoredIdentity()).toBeNull();
  });
});
