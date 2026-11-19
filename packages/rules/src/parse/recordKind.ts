import { parse as parseYaml } from 'yaml';

import { splitFrontmatter } from './splitFrontmatter';

const KIND = /^[a-z][a-z0-9-]*$/;

/**
 * The `kind` a text declares in its frontmatter, or null when it doesn't look like a record at all. Checks nothing
 * else, so records with fields or kinds from a newer version still pass.
 */
export function recordKind(source: string): string | null {
  const { yaml } = splitFrontmatter(source);

  if (yaml === null) return null;

  try {
    const kind = (parseYaml(yaml) as { kind?: unknown } | null)?.kind;

    return typeof kind === 'string' && KIND.test(kind) ? kind : null;
  } catch {
    return null;
  }
}
