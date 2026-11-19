import { z } from 'zod';

import { slug, text } from './fields';

/** A unit id in the list's faction, or `faction/id` for another faction's unit. */
const unitRef = z.string().regex(/^([a-z0-9-]+\/)?[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a unit id or faction/unit-id');

const entry = z.strictObject({
  /** Unique within the list. */
  id: text,
  unit: unitRef,
  models: z.int().min(1),
  wargear: z.array(z.strictObject({ option: slug, models: z.int().min(1), choice: z.array(slug).min(1) })).default([]),
  enhancement: slug.optional(),
  upgrade: slug.optional(),
  /** List entry id of the bodyguard unit this leader or support unit joins. */
  attachedTo: text.optional(),
});

/** An army list as the builder saves it. */
export const listSchema = z.strictObject({
  name: text,
  release: text.optional(),
  /** The army's force disposition, from its detachments; needed when it has several with different ones. */
  disposition: slug.optional(),
  core: text.optional(),
  battleSize: slug,
  faction: slug,
  detachments: z.array(slug).default([]),
  warlord: text.optional(),
  units: z.array(entry).default([]),
  formation: z
    .strictObject({
      reserves: z.array(text).default([]),
      /** Transport entry id to the entry ids embarked in it. */
      embarked: z.record(z.string(), z.array(text)).default({}),
    })
    .optional(),
});
