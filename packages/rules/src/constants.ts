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

/** Widest an icon glyph may be, in em: wider ones are drawn smaller so they fit the same square as the rest. */
export const ICON_MAX_WIDTH_EM = 1.3;

/** Widths in em of the wh40k-icon glyphs wider than {@link ICON_MAX_WIDTH_EM}; every other glyph fits. */
export const WIDE_ICONS: Record<string, number> = {
  'adeptus-astartes': 1.46,
  'adeptus-terra': 2.34,
  'aeronautica-imperialis': 1.54,
  'angels-of-absolution': 1.56,
  'angels-of-redemption': 1.73,
  'angels-of-retribution': 1.56,
  'apothecarium-01': 2.43,
  'astra-militarum': 2.94,
  'blood-ravens': 1.94,
  'dark-brotherhood': 1.66,
  'death-eagles': 2.29,
  'deathskulls-clan': 1.52,
  'forge-world-graia': 1.69,
  'high-lords-of-terra': 2.34,
  'imperial-aquila': 2.73,
  'imperial-aquila-02': 2.7,
  'imperial-navy': 1.77,
  jokaero: 2.06,
  'librarian-codicier': 1.82,
  'librarian-lexicanum': 2.89,
  'rogue-trader': 2.06,
  'solar-auxilia': 1.61,
  'sons-of-malice': 1.92,
  tyranids: 1.63,
};
