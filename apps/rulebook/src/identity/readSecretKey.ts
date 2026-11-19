import { decryptSecretKey, normalizeSecretKey } from 'tool-db';

/**
 * Reads a secret key someone pasted: `nsec1…`, 64 hex characters, or `ncryptsec1…` with its password. Returns the key
 * in hex, or a message saying what is wrong.
 */
export async function readSecretKey(text: string, password = ''): Promise<{ secret: string } | { error: string }> {
  const key = text.trim();

  if (key.startsWith('ncryptsec1')) {
    if (!password) return { error: 'This key is password-protected: enter its password.' };

    try {
      return { secret: await decryptSecretKey(key, password) };
    } catch {
      return { error: 'Wrong password, or the key is damaged.' };
    }
  }

  try {
    return { secret: normalizeSecretKey(key) };
  } catch {
    return { error: 'Paste a secret key: nsec1…, ncryptsec1… or 64 hex characters.' };
  }
}
