import { LINK_CODE_ALPHABET, LINK_CODE_LENGTH } from '../constants';

/** A new random code for a device link, e.g. `K7QMRB`. */
export function linkCode(random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  return [...random(LINK_CODE_LENGTH)].map((b) => LINK_CODE_ALPHABET[b % LINK_CODE_ALPHABET.length]).join('');
}
