/** Datasheet roles that muster limits and constraints can refer to. */
export const ROLES = ['character', 'epic-hero', 'battleline', 'dedicated-transport', 'fortification'] as const;

/** Name of the file that marks a folder as a faction bundle. */
export const FACTION_FILE = 'faction.md';

/** Bundle folder holding the core records (muster rules) instead of a faction. */
export const CORE_BUNDLE = 'core';

/** The `## ` headings a unit file may use, matched without regard to case, and where each one is stored. */
export const UNIT_SECTIONS = {
  abilities: 'abilities',
  leader: 'leader',
  support: 'support',
  transport: 'transport',
  'wargear options': 'wargearOptions',
  'wargear abilities': 'wargearAbilities',
  'unit composition': 'unitComposition',
  description: 'description',
} as const;

/** The `## ` headings a detachment file may use. */
export const DETACHMENT_SECTIONS = {
  description: 'description',
  'detachment rule': 'rule',
  'detachment rules': 'rule',
  enhancements: 'enhancements',
  stratagems: 'stratagems',
} as const;

/** The `## ` headings a muster file may use. */
export const MUSTER_SECTIONS = { description: 'description', stratagems: 'stratagems' } as const;
