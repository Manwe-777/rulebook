import { getConversationKey, getPublicKey, nip44Decrypt, nip44Encrypt } from 'tool-db';

/**
 * Encrypts and decrypts text for one's own key (NIP-44 between a key and itself), so only someone with the secret key
 * can read it.
 */
export function selfCipher(secret: string) {
  const conversation = getConversationKey(secret, getPublicKey(secret));

  return {
    encrypt: (text: string) => nip44Encrypt(text, conversation),
    decrypt: (payload: string) => nip44Decrypt(payload, conversation),
  };
}
