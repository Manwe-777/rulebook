import { slugify } from '@rulebook/rules';

import type { EditableKind } from './types';

/** A minimal valid record to start a new unit or detachment from. */
export function recordTemplate(
  kind: Extract<EditableKind, 'unit' | 'detachment'>,
  name: string,
  factionKeyword: string,
) {
  if (kind === 'detachment') {
    return `---
kind: detachment
id: ${slugify(name)}
name: ${name}
points: 0
enhancements: []
stratagems: []
---

## Detachment rule

### Rule name

Describe the rule in your own words.
`;
  }

  return `---
kind: unit
id: ${slugify(name)}
name: ${name}
profiles:
  - { name: ${name}, M: 6", T: 4, Sv: 3+, W: 2, Ld: 6+, OC: 1 }
composition:
  models: [{ name: ${name}, min: 5, max: 10 }]
  points: [{ models: 5, points: 100 }, { models: 10, points: 200 }]
keywords: [INFANTRY]
factionKeywords: [${factionKeyword}]
---

## Abilities

**Ability name:** Describe it in your own words.
`;
}
