import { slugify, type Unit, wargearName } from '@rulebook/rules';

const NAMED = /^\*\*([^*]+?):?\*\*/;

/**
 * The unit's wargear abilities (`## Wargear abilities`, one `**Name:**` paragraph each), keeping only the items the
 * unit carries unless `showAll` is on. Paragraphs not named after an item are always kept.
 */
export function carriedWargearRules(unit: Unit, carried: string[], showAll: boolean): string | undefined {
  const text = unit.sections.wargearAbilities;

  if (!text || showAll) return text;

  const names = new Set(carried.map((id) => slugify(wargearName(unit, id))));

  const kept = text.split(/\n\s*\n/).filter((paragraph) => {
    const name = NAMED.exec(paragraph.trim())?.[1];

    return !name || names.has(slugify(name));
  });

  return kept.length ? kept.join('\n\n') : undefined;
}
