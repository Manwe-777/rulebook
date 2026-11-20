import { readFileSync } from 'node:fs';

import { decryptSecretKey } from 'tool-db';

import { askHidden } from './askHidden';

/**
 * A secret key: from a password-protected key file (`ncryptsec`, as the rulebook's Account page and `owner-key` save
 * it), asking for its password, or else from `RULEBOOK_SECRET` (hex). Null when neither is given or the password is
 * wrong.
 */
export async function readSecret(keyFile: string | undefined, env: Record<string, string | undefined>) {
  if (!keyFile) return env.RULEBOOK_SECRET || null;

  const prompt = askHidden();
  const password = await prompt.ask(`Password for ${keyFile}: `);

  prompt.close();

  return decryptSecretKey(readFileSync(keyFile, 'utf8').trim(), password).catch(() => null);
}
