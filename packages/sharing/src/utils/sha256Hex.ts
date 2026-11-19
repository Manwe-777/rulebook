/** SHA-256 of a text (UTF-8) in lowercase hex. Works in browsers and Node. */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));

  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
