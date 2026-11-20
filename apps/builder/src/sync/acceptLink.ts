import { decryptSecretKey } from 'tool-db';

import { normalizeLinkCode } from '../utils/normalizeLinkCode';

/** The key a device link carries, opened with the code typed in, or a message when the code doesn't open it. */
export async function acceptLink(ncryptsec: string, typed: string): Promise<{ secret: string } | { error: string }> {
  const code = normalizeLinkCode(typed);

  if (!code) return { error: 'Type the code shown on your other device.' };

  try {
    return { secret: await decryptSecretKey(ncryptsec, code) };
  } catch {
    return { error: "That code doesn't match. Check it on your other device and try again." };
  }
}
