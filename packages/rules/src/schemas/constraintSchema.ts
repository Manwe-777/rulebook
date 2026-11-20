import { z } from 'zod';

import { count, keywords, role, share, slug, text } from './fields';

export const unitFilter = z.strictObject({
  ids: z.array(slug).optional(),
  keywords: z.array(text).optional(),
  anyKeywords: z.array(text).optional(),
  roles: z.array(role).optional(),
  not: z.boolean().default(false),
});

/** Picks list entries. Every given field must match. */
export const selectorSchema = z.strictObject({
  units: unitFilter.optional(),
  enhancements: z.strictObject({ ids: z.array(slug) }).optional(),
  upgrades: z.strictObject({ ids: z.array(slug) }).optional(),
  attached: unitFilter.optional(),
  /** `true` picks only the warlord's entry, `false` every other entry. */
  warlord: z.boolean().optional(),
});

/** Holds when every given field does: a chosen detachment, the battle size, the army's faction, a selected entry. */
export const conditionSchema = z.strictObject({
  detachment: slug.optional(),
  battleSize: slug.optional(),
  faction: slug.optional(),
  has: selectorSchema.optional(),
});

/** An army rule written as data: select entries, measure them and compare the result. See docs/validation.md. */
export const constraintSchema = z
  .strictObject({
    id: slug,
    when: conditionSchema.optional(),
    /** The constraint doesn't apply while this holds. */
    unless: conditionSchema.optional(),
    allow: z.enum(['faction', 'datasheet-limit', 'attachments']).optional(),
    select: selectorSchema,
    measure: z.enum(['count', 'models', 'points']).default('count'),
    min: count.optional(),
    max: count.optional(),
    equal: count.optional(),
    maxShare: share.optional(),
    message: text,
  })
  .refine((c) => c.allow !== undefined || [c.min, c.max, c.equal, c.maxShare].some((v) => v !== undefined), {
    message: 'needs a comparison: min, max, equal or maxShare (only an allow can go without one)',
  });

export const constraintsSchema = z.array(constraintSchema).default([]);

/** Keywords a bearer needs (all of `keywords`, one of `anyKeywords`), and keywords and roles that rule it out. */
export const eligibility = {
  keywords,
  anyKeywords: keywords,
  excludeKeywords: keywords,
  excludeRoles: z.array(role).default([]),
};
