import { z } from 'zod';

import { constraintsSchema } from './constraintSchema';
import { hexColor, iconName, slug, text } from './fields';

/** The frontmatter of a faction record. */
export const factionSchema = z.strictObject({
  kind: z.literal('faction'),
  id: slug.optional(),
  name: text,
  /** Header colour for every datasheet in the faction. */
  color: hexColor.optional(),
  /** Icon name from the wh40k-icon font, e.g. `orks`. */
  icon: iconName.optional(),
  /** The keyword that makes a datasheet part of this faction. */
  factionKeyword: text,
  /**
   * Factions whose datasheets and detachments this one's armies can also use, e.g. a chapter including
   * `space-marines`. Its own records win over included ones with the same id.
   */
  includes: z.array(slug).default([]),
  /** Ids of included datasheets and detachments this faction's armies can't use. */
  excludes: z.array(slug).default([]),
  /** Faction resources spent by rules, shown on the army sheet. */
  resources: z.array(z.strictObject({ id: slug, name: text, short: text.optional() })).default([]),
  constraints: constraintsSchema,
});
