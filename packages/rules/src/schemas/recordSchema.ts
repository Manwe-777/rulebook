import { z } from 'zod';

import { detachmentSchema } from './detachmentSchema';
import { factionSchema } from './factionSchema';
import { glossarySchema } from './glossarySchema';
import { musterSchema } from './musterSchema';
import { unitSchema } from './unitSchema';

/** The frontmatter of any record, picked by its `kind`. */
export const recordSchema = z.discriminatedUnion(
  'kind',
  [factionSchema, unitSchema, detachmentSchema, musterSchema, glossarySchema],
  { error: 'must be faction, unit, detachment, muster or glossary' },
);
