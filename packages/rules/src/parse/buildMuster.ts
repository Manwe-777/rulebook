import type { z } from 'zod';

import { MUSTER_SECTIONS } from '../constants';
import type { musterSchema } from '../schemas/musterSchema';
import type { Muster } from '../types';
import { slugify } from '../utils/slugify';
import { attachEntryTexts } from './attachEntryTexts';
import { splitSections } from './splitSections';

/** The muster rules from their checked frontmatter and Markdown body; each core stratagem gets its text. */
export function buildMuster(data: z.output<typeof musterSchema>, body: string, id: string) {
  const { sections, errors } = splitSections(body, MUSTER_SECTIONS);
  const withIds = data.stratagems.map((s) => ({ ...s, id: s.id ?? slugify(s.name) }));
  const stratagems = attachEntryTexts(withIds, sections.stratagems, 'Stratagems');
  const value: Muster = { ...data, id, stratagems: stratagems.entries, sections };

  return { value, errors: [...errors, ...stratagems.errors] };
}
