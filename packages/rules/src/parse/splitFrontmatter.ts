const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** Splits a file into its leading `---` YAML block and the Markdown after it. `yaml` is null when there is no block. */
export function splitFrontmatter(source: string): { yaml: string | null; body: string } {
  const text = source.replace(/^\uFEFF/, '');
  const match = FRONTMATTER.exec(text);

  if (!match) return { yaml: null, body: text };

  return { yaml: match[1], body: text.slice(match[0].length) };
}
