/**
 * Splits a Markdown body on its `## ` headings. `headings` maps each allowed heading (lowercase) to the key it is
 * stored under. Text before the first heading is an error, as is a heading that isn't allowed or appears twice.
 */
export function splitSections<K extends string>(
  body: string,
  headings: Record<string, K>,
): { sections: Partial<Record<K, string>>; errors: string[] } {
  const sections: Partial<Record<K, string>> = {};
  const errors: string[] = [];
  const parts = body.split(/^##[ \t]+(.+?)[ \t]*$/m);

  if (parts[0].trim()) errors.push('text before the first "## " heading is not part of any section');

  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i];
    const key = headings[heading.toLowerCase()];

    if (!key) errors.push(`unknown section "## ${heading}"`);
    else if (sections[key] !== undefined) errors.push(`section "## ${heading}" appears more than once`);
    else sections[key] = parts[i + 1].trim();
  }

  return { sections, errors };
}
