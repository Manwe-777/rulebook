import { LINK_HASH } from '../constants';

/** The protected key a device link carries in an address hash (`#link=ncryptsec1…`), or null. */
export function linkFromHash(hash: string): string | null {
  const value = new URLSearchParams(hash.replace(/^#/, '')).get(LINK_HASH);

  return value?.startsWith('ncryptsec1') ? value : null;
}
