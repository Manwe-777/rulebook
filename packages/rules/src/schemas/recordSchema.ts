import { z } from 'zod';

import { detachmentSchema } from './detachmentSchema';
import { factionSchema } from './factionSchema';
import { musterSchema } from './musterSchema';
import { unitSchema } from './unitSchema';

/** The frontmatter of any record, picked by its `kind`. */
export const recordSchema = z.discriminatedUnion('kind', [factionSchema, unitSchema, detachmentSchema, musterSchema], {
  error: 'must be faction, unit, detachment or muster',
});
