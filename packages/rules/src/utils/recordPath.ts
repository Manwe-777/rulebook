/**
 * Splits a rules file path into its bundle folder and file name: `content/orks/boyz.md` → `{ bundle: 'orks', name:
 * 'boyz' }`. Anything before and including a `content/` folder is ignored. Returns null for paths that aren't exactly
 * `<bundle>/<file>.md`.
 */
export function recordPath(path: string): { bundle: string; name: string } | null {
  const parts = path
    .replace(/\\/g, '/')
    .replace(/^.*?(^|\/)content\//, '')
    .split('/')
    .filter(Boolean);

  if (parts.length !== 2 || !/\.md$/i.test(parts[1])) return null;

  return { bundle: parts[0], name: parts[1].replace(/\.md$/i, '') };
}
