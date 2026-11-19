import { npubDecode } from 'tool-db';

const HEX_KEY = /^[0-9a-f]{64}$/;

/** The owner public key as hex, given as hex or as an npub; empty when it is neither. */
export function ownerKeyHex(value: string): string {
  const key = value.trim();

  if (HEX_KEY.test(key)) return key;
  if (!key.startsWith('npub1')) return '';

  try {
    return npubDecode(key);
  } catch {
    return '';
  }
}
