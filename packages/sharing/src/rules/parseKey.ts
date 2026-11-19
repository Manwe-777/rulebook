/** A final tool-db key split into its namespace owner (for `:<p>.` keys) and its `/`-separated parts. */
export function parseKey(key: string): { owner?: string; parts: string[] } {
  if (!key.startsWith(':')) return { parts: key.split('/') };

  const dot = key.indexOf('.');

  return { owner: key.slice(1, dot), parts: key.slice(dot + 1).split('/') };
}
