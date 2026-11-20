import type { z } from 'zod';

import type { DETACHMENT_SECTIONS, MUSTER_SECTIONS, UNIT_SECTIONS } from './constants';
import type { conditionSchema, constraintSchema, selectorSchema } from './schemas/constraintSchema';
import type { detachmentSchema } from './schemas/detachmentSchema';
import type { factionSchema } from './schemas/factionSchema';
import type { glossarySchema } from './schemas/glossarySchema';
import type { listSchema } from './schemas/listSchema';
import type { musterSchema } from './schemas/musterSchema';
import type { unitSchema } from './schemas/unitSchema';

/** Markdown sections of a record body, by key. */
export type Sections<T extends Record<string, string>> = Partial<Record<T[keyof T], string>>;

type UnitData = z.output<typeof unitSchema>;

export type Role = UnitData['roles'][number];
export type Profile = UnitData['profiles'][number];
export type RangedWeapon = UnitData['ranged'][number] & { id: string };
export type MeleeWeapon = UnitData['melee'][number] & { id: string };
export type Weapon = RangedWeapon | MeleeWeapon;
export type WargearOption = UnitData['wargearOptions'][number];
export type UnitSections = Sections<typeof UNIT_SECTIONS>;

export type Equipment = UnitData['equipment'][number] & { id: string };

export interface Unit extends Omit<UnitData, 'id' | 'ranged' | 'melee' | 'equipment'> {
  /** Unique within its faction, e.g. `boyz`. */
  id: string;
  ranged: RangedWeapon[];
  melee: MeleeWeapon[];
  equipment: Equipment[];
  sections: UnitSections;
}

type DetachmentData = z.output<typeof detachmentSchema>;

export type Enhancement = DetachmentData['enhancements'][number] & { id: string; text?: string };
export type Stratagem = DetachmentData['stratagems'][number] & { id: string; text?: string };

export interface Detachment extends Omit<DetachmentData, 'id' | 'enhancements' | 'stratagems'> {
  id: string;
  enhancements: Enhancement[];
  stratagems: Stratagem[];
  sections: Sections<typeof DETACHMENT_SECTIONS>;
}

export interface Muster extends Omit<z.output<typeof musterSchema>, 'id'> {
  id: string;
  sections: Sections<typeof MUSTER_SECTIONS>;
}

export type BattleSize = Muster['battleSizes'][number];
export type Constraint = z.output<typeof constraintSchema>;
export type Selector = z.output<typeof selectorSchema>;
export type Condition = z.output<typeof conditionSchema>;

export interface FactionRecord extends Omit<z.output<typeof factionSchema>, 'id'> {
  id: string;
  /** Everything after the frontmatter: description, army rules, as Markdown. */
  body: string;
}

/** One explained rule term, e.g. `Sustained Hits X` and what it does. */
export interface GlossaryEntry {
  term: string;
  text: string;
}

export interface Glossary extends Omit<z.output<typeof glossarySchema>, 'id'> {
  id: string;
  entries: GlossaryEntry[];
}

/** Any record, as parsed from one file. */
export type RulesRecord = FactionRecord | Unit | Detachment | Muster | Glossary;

export interface Faction extends FactionRecord {
  /** Sorted by name. */
  units: Unit[];
  /** Sorted by name. */
  detachments: Detachment[];
}

/** A rules file as read from any source. `path` is relative, e.g. `content/orks/boyz.md` or `orks/boyz.md`. */
export interface RulesFile {
  path: string;
  source: string;
}

/** Problems found in one file. */
export interface FileErrors {
  path: string;
  errors: string[];
}

export type ParseResult<T> = { ok: true; value: T } | ({ ok: false } & FileErrors);

export type ArmyList = z.output<typeof listSchema>;
export type ListEntry = ArmyList['units'][number];

/** A problem found in a list or a dataset. */
export interface Issue {
  /** Stable id, e.g. `points-over-limit`. */
  code: string;
  /** Errors make a list illegal; warnings don't. */
  severity: 'error' | 'warning';
  message: string;
  /** List entry ids (or record ids for dataset checks) the issue is about. */
  entries: string[];
  /** `core`, or the record id whose rule raised it. */
  source: string;
}
