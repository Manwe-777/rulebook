import { z } from 'zod';

import { slug, text } from './fields';

/** The frontmatter of a glossary record: rule terms explained in the body, one `###` heading per term. */
export const glossarySchema = z.strictObject({
  kind: z.literal('glossary'),
  id: slug.optional(),
  name: text,
});
