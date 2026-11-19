import { parse as parseYaml } from 'yaml';
import type { z } from 'zod';

import { splitFrontmatter } from './splitFrontmatter';

/** Splits off and validates a file's frontmatter. Returns the parsed data and the Markdown body, or the problems. */
export function readFrontmatter<S extends z.ZodType>(
  source: string,
  schema: S,
): { data: z.output<S>; body: string; errors?: undefined } | { errors: string[]; body: string } {
  const { yaml, body } = splitFrontmatter(source);

  if (yaml === null) return { errors: ['missing the "---" frontmatter block at the top'], body };

  let raw: unknown;

  try {
    raw = parseYaml(yaml);
  } catch (e) {
    return { errors: [`frontmatter is not valid YAML: ${(e as Error).message.split('\n')[0]}`], body };
  }

  const result = schema.safeParse(raw ?? {});

  if (result.success) return { data: result.data, body };

  return { errors: result.error.issues.map((i) => `${i.path.join('.') || 'frontmatter'}: ${i.message}`), body };
}
