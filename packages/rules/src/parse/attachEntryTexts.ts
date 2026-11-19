import { slugify } from '../utils/slugify';
import { splitEntries } from './splitEntries';

/**
 * Gives each frontmatter entry the text under its `###` heading in a section, matching the heading to the entry's id
 * or name. A heading that matches no entry is reported.
 */
export function attachEntryTexts<T extends { id: string; name: string }>(
  entries: T[],
  section: string | undefined,
  label: string,
): { entries: (T & { text?: string })[]; errors: string[] } {
  const texts = new Map<string, string>();
  const errors: string[] = [];

  for (const { heading, text } of splitEntries(section ?? '').entries) {
    const match = entries.find((e) => e.id === slugify(heading) || slugify(e.name) === slugify(heading));

    if (match) texts.set(match.id, text);
    else errors.push(`### ${heading} in ${label} matches no ${label.toLowerCase()} entry in the frontmatter`);
  }

  return { entries: entries.map((e) => (texts.has(e.id) ? { ...e, text: texts.get(e.id) } : e)), errors };
}
