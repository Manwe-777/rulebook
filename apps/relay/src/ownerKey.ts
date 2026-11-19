import { existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

import { encryptSecretKey, generateSecretKey, getPublicKey, npubEncode } from 'tool-db';

/**
 * Makes the project's owner key. Prints the public key and saves the secret key only password-protected (NIP-49) in
 * a file outside the repository. Usage: npm run owner-key -w @rulebook/relay -- [file]
 */
const file = resolve(process.argv[2] ?? join(homedir(), 'rulebook-owner.ncryptsec'));

if (existsSync(file)) {
  console.error(`${file} already exists; pick another file so an existing owner key is never overwritten.`);
  process.exit(1);
}

if (file.startsWith(resolve(import.meta.dirname, '../../..'))) {
  console.error('Save the owner key outside the repository.');
  process.exit(1);
}

const prompt = createInterface({ input: process.stdin, output: process.stdout });
const lines = prompt[Symbol.asyncIterator]();

/** Asks a question and reads one line; works when typed or piped. */
async function ask(question: string): Promise<string> {
  process.stdout.write(question);

  return ((await lines.next()).value as string | undefined) ?? '';
}

const password = await ask('Password for the owner key (at least 12 characters): ');
const again = await ask('\nSame password again: ');

prompt.close();
process.stdout.write('\n');

if (password.length < 12 || password !== again) {
  console.error('The passwords are shorter than 12 characters or do not match.');
  process.exit(1);
}

const secret = generateSecretKey();
const publicKey = getPublicKey(secret);

writeFileSync(file, `${await encryptSecretKey(secret, password)}\n`, { mode: 0o600 });

console.log(`Saved the password-protected secret key to ${file}. Keep a copy in your password manager.`);
console.log(`Public key (RULEBOOK_OWNER and VITE_RULEBOOK_OWNER): ${publicKey}`);
console.log(`Same key as npub: ${npubEncode(publicKey)}`);
