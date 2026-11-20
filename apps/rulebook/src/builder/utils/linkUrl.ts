import { LINK_HASH } from '../constants';

/**
 * The address another device opens to link: the builder's own address with the protected key after `#`, so it never
 * reaches a server.
 */
export function linkUrl(base: string, ncryptsec: string): string {
  return `${base.replace(/#.*$/, '')}#${LINK_HASH}=${ncryptsec}`;
}
