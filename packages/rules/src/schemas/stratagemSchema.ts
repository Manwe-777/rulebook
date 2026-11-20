import { z } from 'zod';

import { slug, text } from './fields';

/**
 * A stratagem: name, cost and category. Its text lives in the record body under its `###` heading. `turn` says whose
 * turn it is used in (the colour codices print it in); left out, it is read from the text's **When:** line.
 */
export const stratagemSchema = z.strictObject({
  id: slug.optional(),
  name: text,
  cp: z.int().min(0),
  category: text.optional(),
  turn: z.enum(['your', 'opponent', 'either']).optional(),
});
