import { z } from 'zod';

import { conditionSchema, constraintsSchema } from './constraintSchema';
import { count, hexColor, iconName, keywords, points, role, slug, stat, text } from './fields';

const tags = z.array(text).default([]);

const profile = z.strictObject({
  name: text,
  M: stat,
  T: stat,
  Sv: stat,
  InSv: stat.optional(),
  W: stat,
  Ld: stat,
  OC: stat,
  /** Base size as printed on the box, e.g. `32mm` or `90 x 52mm oval`. */
  base: text.optional(),
});

/**
 * One weapon profile. Rows that share a `group` are alternative profiles of one weapon; pick one before attacking.
 * Wargear refers to a weapon by `id`, which defaults to the slug of its group or name.
 */
const weaponFields = {
  id: slug.optional(),
  name: text,
  group: text.optional(),
  tags,
  S: stat,
  AP: stat,
  D: stat,
  A: stat,
};

const rangedWeapon = z.strictObject({ ...weaponFields, range: stat, BS: stat });

const meleeWeapon = z.strictObject({ ...weaponFields, WS: stat });

/**
 * How many models may take a wargear option: up to a number, `count` (default 1) in every `every` models, or all of
 * them.
 */
const per = z.union([
  z.int().min(1),
  z.strictObject({ every: z.int().min(1), count: z.int().min(1).default(1) }),
  z.literal('all'),
]);

const wargearOption = z.strictObject({
  id: slug,
  /** Model type that may take it; any model in the unit when left out. */
  models: text.optional(),
  per: per.default('all'),
  replace: z.array(slug).default([]),
  /** Pick one of these lists of weapon ids. */
  with: z.array(z.array(slug).min(1)).min(1),
  /** Cost per model taking it. */
  points: points.default(0),
  /**
   * Options sharing a group are alternatives for the same models ("one or the other"): together they can be taken by no
   * more models than the most any one of them allows.
   */
  group: slug.optional(),
});

const composition = z.strictObject({
  models: z.array(z.strictObject({ name: text, min: count, max: z.int().min(1) })).min(1),
  /**
   * Cost by unit size, counting every model. `counts` says how many of each model type the size has (types left out
   * have none), for units whose cost depends on which models they have, not only how many.
   */
  points: z.array(z.strictObject({ models: z.int().min(1), points, counts: z.record(text, count).optional() })).min(1),
  /** From the `from`th copy of this datasheet in an army, each copy costs `points` more. */
  copies: z.strictObject({ from: z.int().min(2), points }).optional(),
  /** Wargear that costs extra, by id: each one the unit carries (by default or by choice) adds its points. */
  itemPoints: z.record(slug, points).default({}),
  /** Default weapon ids per model type. */
  wargear: z.record(z.string(), z.array(slug)).default({}),
});

const attaches = z.strictObject({
  bodyguards: z.array(slug).min(1),
  /** Only while this holds, e.g. `{ has: { units: { ids: [marneus-calgar] } } }`. */
  when: conditionSchema.optional(),
  /** Not while this holds. */
  unless: conditionSchema.optional(),
});

const transport = z.strictObject({
  capacity: z.int().min(1),
  /** Keywords a model needs to embark. */
  allows: keywords,
  excludes: keywords,
  /** Models with these keywords take this many places. */
  space: z.record(z.string(), z.int().min(1)).default({}),
});

/** The frontmatter of a unit record: everything with a fixed shape on the datasheet. */
export const unitSchema = z.strictObject({
  kind: z.literal('unit'),
  id: slug.optional(),
  name: text,
  subtitle: text.optional(),
  image: z.url().optional(),
  /** Header colour, overriding the faction's default. */
  color: hexColor.optional(),
  /** Icon name from the wh40k-icon font (e.g. `orks`), overriding the faction's default. */
  icon: iconName.optional(),
  roles: z.array(role).default([]),
  profiles: z.array(profile).min(1),
  ranged: z.array(rangedWeapon).default([]),
  melee: z.array(meleeWeapon).default([]),
  coreAbilities: z.array(text).default([]),
  factionAbilities: z.array(text).default([]),
  composition,
  wargearOptions: z.array(wargearOption).default([]),
  /**
   * Wargear without a weapon profile (crests, scanners, launchers). Referred to by id like weapons; each item's rules go
   * under `## Wargear abilities` in the body.
   */
  equipment: z.array(z.strictObject({ id: slug.optional(), name: text })).default([]),
  leader: attaches.optional(),
  support: attaches.optional(),
  transport: transport.optional(),
  detectionRange: stat.optional(),
  keywords: z.array(text).min(1),
  factionKeywords: z.array(text).min(1),
  /** Army rules this datasheet brings, checked whenever the army includes it ("can't be your Warlord"). */
  constraints: constraintsSchema,
});
