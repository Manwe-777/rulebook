import { encryptSecretKey } from 'tool-db';

import { LINK_KEY_LOGN } from '../constants';
import { linkCode } from '../utils/linkCode';
import { linkUrl } from '../utils/linkUrl';

/**
 * A device link for this key: a new short code, and the address to open on the other device, which carries the key
 * protected with that code. The address alone can't be used without the code.
 */
export async function createLink(secret: string, base: string): Promise<{ code: string; url: string }> {
  const code = linkCode();

  return { code, url: linkUrl(base, await encryptSecretKey(secret, code, LINK_KEY_LOGN)) };
}
