import { z } from 'zod';

import { constraintsSchema, eligibility } from './constraintSchema';
import { points, slug, text } from './fields';

const enhancement = z.strictObject({
  id: slug.optional(),
  name: text,
  points,
  /** `model`: given to one model; `unit`: an upgrade for a whole unit. */
  target: z.enum(['model', 'unit']).default('model'),
  ...eligibility,
});

const stratagem = z.strictObject({
  id: slug.optional(),
  name: text,
  cp: z.int().min(0),
  category: text.optional(),
});

/** The frontmatter of a detachment record. Rules text for each entry lives in the body under its `###` heading. */
export const detachmentSchema = z.strictObject({
  kind: z.literal('detachment'),
  id: slug.optional(),
  name: text,
  /** Cost in detachment points, paid from the battle size's budget (not from the army's points). */
  cost: z.int().min(0).default(1),
  /** Force disposition (an id from the muster rules' `dispositions`); it sets the army's primary missions. */
  disposition: slug.optional(),
  /** Tags: an army can't take two detachments that share one. */
  unique: z.array(text).default([]),
  enhancements: z.array(enhancement).default([]),
  stratagems: z.array(stratagem).default([]),
  constraints: constraintsSchema,
});
