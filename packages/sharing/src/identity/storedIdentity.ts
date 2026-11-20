import { z } from 'zod';

import { IDENTITY_KEY } from '../constants';

const hex = z.string().regex(/^[0-9a-f]{64}$/);

/** How this browser signs: a stored key, a password-protected key, or a browser extension. */
export const storedIdentitySchema = z.discriminatedUnion('mode', [
  z.strictObject({ mode: z.literal('browser'), secret: hex }),
  z.strictObject({ mode: z.literal('protected'), ncryptsec: z.string().startsWith('ncryptsec1') }),
  z.strictObject({ mode: z.literal('extension') }),
]);

export type StoredIdentity = z.output<typeof storedIdentitySchema>;

/** The identity saved in this browser, or null when there is none, it can't be read, or storage is blocked. */
export function loadStoredIdentity(): StoredIdentity | null {
  try {
    const parsed = storedIdentitySchema.safeParse(JSON.parse(localStorage.getItem(IDENTITY_KEY) ?? 'null'));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Saves the identity, or forgets it with null. Returns false when storage can't be used. */
export function saveStoredIdentity(identity: StoredIdentity | null): boolean {
  try {
    if (identity) localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
    else localStorage.removeItem(IDENTITY_KEY);

    return true;
  } catch {
    return false;
  }
}
