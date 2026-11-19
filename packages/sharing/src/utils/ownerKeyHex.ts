import { bech32, hex } from '@scure/base';

const HEX_KEY = /^[0-9a-f]{64}$/;

/** The npub's key as hex, or empty when it isn't a valid npub. */
function decodeNpub(npub: string): string {
  try {
    const { prefix, words } = bech32.decode(npub as `${string}1${string}`);
    const bytes = bech32.fromWords(words);

    return prefix === 'npub' && bytes.length === 32 ? hex.encode(bytes) : '';
  } catch {
    return '';
  }
}

/**
 * The owner public key as hex, given as hex or as an npub; empty when it is neither. Uses only bech32 decoding, so the
 * apps can read their owner key without loading tool-db.
 */
export function ownerKeyHex(value: string): string {
  const key = value.trim();

  if (HEX_KEY.test(key)) return key;

  return key.startsWith('npub1') ? decodeNpub(key) : '';
}
