import { z } from 'zod';

import { constraintsSchema, eligibility, unitFilter } from './constraintSchema';
import { count, keywords, points, role, slug, text } from './fields';
import { stratagemSchema } from './stratagemSchema';

const enhancement = z.strictObject({
  id: slug.optional(),
  name: text,
  points,
  /** `model`: given to one model; `unit`: an upgrade for a whole unit. */
  target: z.enum(['model', 'unit']).default('model'),
  ...eligibility,
});

/**
 * Roles and keywords the detachment gives units of the army, e.g. `{ units: { ids: [warbikers] }, roles: [battleline],
 * keywords: [BATTLELINE] }`, or up to `max` of them in list order (`max: 2` Trygons become characters).
 */
const grant = z.strictObject({
  units: unitFilter,
  roles: z.array(role).default([]),
  keywords,
  max: count.optional(),
});

/** The frontmatter of a detachment record. Rules text for each entry lives in the body under its `###` heading. */
export const detachmentSchema = z.strictObject({
  kind: z.literal('detachment'),
  id: slug.optional(),
  name: text,
  /** Cost in detachment points, paid from the battle size's budget (not from the army's points). */
  cost: z.int().min(0).default(1),
  /**
   * Force dispositions it offers (ids from the muster rules' `dispositions`); the army's disposition sets its primary
   * missions.
   */
  dispositions: z.array(slug).default([]),
  /** Tags: an army can't take two detachments that share one. */
  unique: z.array(text).default([]),
  enhancements: z.array(enhancement).default([]),
  stratagems: z.array(stratagemSchema).default([]),
  grants: z.array(grant).default([]),
  constraints: constraintsSchema,
});
