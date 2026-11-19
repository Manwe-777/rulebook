import type { z } from 'zod';

import { DETACHMENT_SECTIONS } from '../constants';
import type { detachmentSchema } from '../schemas/detachmentSchema';
import type { Detachment } from '../types';
import { slugify } from '../utils/slugify';
import { attachEntryTexts } from './attachEntryTexts';
import { splitSections } from './splitSections';

const withId = <T extends { id?: string; name: string }>(e: T) => ({ ...e, id: e.id ?? slugify(e.name) });

/** A detachment from its checked frontmatter and Markdown body; each enhancement and stratagem gets its text. */
export function buildDetachment(data: z.output<typeof detachmentSchema>, body: string, id: string) {
  const { sections, errors } = splitSections(body, DETACHMENT_SECTIONS);
  const enhancements = attachEntryTexts(data.enhancements.map(withId), sections.enhancements, 'Enhancements');
  const stratagems = attachEntryTexts(data.stratagems.map(withId), sections.stratagems, 'Stratagems');

  const value: Detachment = {
    ...data,
    id,
    enhancements: enhancements.entries,
    stratagems: stratagems.entries,
    sections,
  };

  return { value, errors: [...errors, ...enhancements.errors, ...stratagems.errors] };
}
