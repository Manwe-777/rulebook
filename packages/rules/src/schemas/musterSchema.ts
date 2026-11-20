import { z } from 'zod';

import { constraintsSchema } from './constraintSchema';
import { count, role, share, slug, text } from './fields';

const limits = {
  /** How many detachments an army takes; `max` left out means only the detachment points limit them. */
  detachments: z.strictObject({ min: count, max: count.optional() }),
  /** Detachment points the army can spend on detachments. */
  detachmentPoints: count,
  /** Copies of the same datasheet, by role; the first entry matching one of the unit's roles wins. */
  datasheetLimits: z.array(z.strictObject({ role: z.union([role, z.literal('default')]), max: count })).min(1),
  enhancements: z.strictObject({
    max: count,
    perModel: count.default(1),
    /** Roles a unit needs for one of its models to take an enhancement. */
    roles: z.array(role).default(['character']),
    excludeRoles: z.array(role).default([]),
  }),
  upgrades: z.strictObject({
    max: count,
    perUnit: count.default(1),
    /** Enhancement slots the army's upgrades use up together, as soon as it takes any. */
    enhancementSlots: count.default(0),
    /** Each upgrade at most once per army; off, the same upgrade can go on several units. */
    once: z.boolean().default(false),
  }),
};

const battleSize = z.strictObject({
  id: slug,
  name: text,
  points: z.int().min(1),
  /** Limits that differ at this battle size. */
  overrides: z.strictObject(limits).partial().default({}),
});

/** The core muster rules every list is checked against. */
export const musterSchema = z.strictObject({
  kind: z.literal('muster'),
  id: slug.optional(),
  name: text,
  battleSizes: z.array(battleSize).min(1),
  ...limits,
  /** An army with a single detachment may take it whatever its cost. */
  anyLoneDetachment: z.boolean().default(false),
  /** Force dispositions a detachment can have; an army with several detachments picks one of theirs. */
  dispositions: z.array(z.strictObject({ id: slug, name: text })).default([]),
  warlord: z.strictObject({ required: z.boolean().default(true), roles: z.array(role).default(['character']) }),
  attachments: z.strictObject({ leadersPerBodyguard: count.default(1), supportPerBodyguard: count.default(1) }),
  strategicReserves: z.strictObject({ maxShare: share }),
  constraints: constraintsSchema,
});
