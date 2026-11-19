import type { ArmyList } from '../types';

/**
 * An army list as text safe for a URL (base64url of its JSON), for links like the rulebook's print page. Put it after
 * `#` so it never reaches a server.
 */
export function encodeListLink(list: ArmyList): string {
  const bytes = new TextEncoder().encode(JSON.stringify(list));
  let binary = '';

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
