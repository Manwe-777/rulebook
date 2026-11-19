/** Splits a section on its `### ` headings into named entries. Text before the first heading is returned as `intro`. */
export function splitEntries(markdown: string): { intro: string; entries: { heading: string; text: string }[] } {
  const parts = markdown.split(/^###[ \t]+(.+?)[ \t]*$/m);
  const entries = [];

  for (let i = 1; i < parts.length; i += 2) entries.push({ heading: parts[i], text: parts[i + 1].trim() });

  return { intro: parts[0].trim(), entries };
}
