/** A trailing value on a rule term: `2`, `3+`, `D6`, `D3+1`, `9"`, `X`, `X+`. */
const VALUE = /\s+(?:\d*D\d+(?:\+\d+)?|\d+\+?"?|X\+?)$/i;

/**
 * The key a rule term is looked up by, so a weapon tag or ability finds its glossary entry whatever its value:
 * `SUSTAINED HITS 2` and `Sustained Hits X` → `SUSTAINED HITS`, `Scouts 9"` → `SCOUTS`, and every `ANTI-…` tag
 * → `ANTI`.
 */
export function glossaryKey(term: string): string {
  const name = term
    .trim()
    .replace(/^\[|\]$/g, '')
    .replace(VALUE, '')
    .trim()
    .toUpperCase();

  return name.startsWith('ANTI-') ? 'ANTI' : name;
}
