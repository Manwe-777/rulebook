import type { z } from 'zod';

import { UNIT_SECTIONS } from '../constants';
import type { unitSchema } from '../schemas/unitSchema';
import type { Unit } from '../types';
import { slugify } from '../utils/slugify';
import { splitSections } from './splitSections';

const withId = <T extends { id?: string; name: string; group?: string }>(w: T) => ({
  ...w,
  id: w.id ?? slugify(w.group ?? w.name),
});

/** A unit from its checked frontmatter and Markdown body. */
export function buildUnit(data: z.output<typeof unitSchema>, body: string, id: string) {
  const { sections, errors } = splitSections(body, UNIT_SECTIONS);
  const value: Unit = { ...data, id, ranged: data.ranged.map(withId), melee: data.melee.map(withId), sections };

  return { value, errors };
}
