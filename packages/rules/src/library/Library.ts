import { CORE_BUNDLE, FACTION_FILE } from '../constants';
import type {
  Detachment,
  Faction,
  FactionRecord,
  FileErrors,
  GlossaryEntry,
  Muster,
  RulesFile,
  RulesRecord,
  Unit,
} from '../types';
import { glossaryKey } from '../utils/glossaryKey';
import { recordPath } from '../utils/recordPath';
import { parseCached } from './parseCached';

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

interface Parsed {
  bundle: string;
  path: string;
  record: RulesRecord;
}

/** A rules file with the folder and name it sits under. */
interface Placed extends RulesFile {
  bundle: string;
  name: string;
}

/** What a faction folder holds besides `faction.md`, read when first asked for. */
interface Contents {
  units: Unit[];
  detachments: Detachment[];
  errors: FileErrors[];
}

/** A `kind: unit` line, as the frontmatter of a datasheet starts. */
const UNIT_KIND = /^kind:\s*unit\s*$/m;

const isFactionFile = (path: string) => path.replace(/\\/g, '/').endsWith(`/${FACTION_FILE}`) || path === FACTION_FILE;

/** Where a record of each kind may sit, or why it can't sit there. */
function misplaced({ bundle, path, record }: Parsed): string | null {
  const core = record.kind === 'muster' || record.kind === 'glossary';

  if (bundle === CORE_BUNDLE) return core ? null : `the ${CORE_BUNDLE} folder only holds muster and glossary records`;
  if (core) return `${record.kind} records belong in the ${CORE_BUNDLE} folder`;
  if (isFactionFile(path) !== (record.kind === 'faction'))
    return `${FACTION_FILE} holds the faction record, and only it does`;

  return null;
}

/** Reads files and keeps the records that sit where they belong; every problem goes to `errors`. */
function readPlaced(files: Placed[], errors: FileErrors[]): Parsed[] {
  const placed: Parsed[] = [];

  for (const file of files) {
    const result = parseCached(file.source, file.path, file.name);

    if (!result.ok) {
      errors.push({ path: result.path, errors: result.errors });
      continue;
    }

    const item = { bundle: file.bundle, path: file.path, record: result.value };
    const problem = misplaced(item);

    if (problem) errors.push({ path: file.path, errors: [problem] });
    else placed.push(item);
  }

  return placed;
}

/** Adds a unit or detachment to its faction's contents, or says why it can't be added. */
function addRecord(contents: Contents | undefined, { bundle, record }: Parsed): string | null {
  if (record.kind !== 'unit' && record.kind !== 'detachment') return null;
  if (!contents) return `folder "${bundle}" has no ${FACTION_FILE}`;

  const list: { id: string }[] = record.kind === 'unit' ? contents.units : contents.detachments;

  if (list.some((r) => r.id === record.id)) return `id "${record.id}" is used twice`;

  list.push(record);

  return null;
}

/** Reads the units and detachments of one folder; `hasFaction` says whether the folder has a `faction.md`. */
function readContents(files: Placed[], hasFaction: boolean): Contents {
  const errors: FileErrors[] = [];
  const contents: Contents = { units: [], detachments: [], errors };

  for (const item of readPlaced(files, errors)) {
    const problem = addRecord(hasFaction ? contents : undefined, item);

    if (problem) errors.push({ path: item.path, errors: [problem] });
  }

  contents.units.sort(byName);
  contents.detachments.sort(byName);

  return contents;
}

/**
 * Every faction read from a set of rules files, the core muster rules, and the problems found. A faction is a folder
 * holding a `faction.md` and one file per unit or detachment; the `core` folder holds the muster rules. Files that
 * can't be used are left out and reported, never thrown.
 *
 * Only the core records and each `faction.md` are read up front: a faction's units and detachments are read the first
 * time they are asked for, and files read before (for an earlier library) aren't read again.
 */
export class Library {
  readonly factions: Faction[];
  readonly muster: Muster | undefined;
  /** Rule terms explained by the core glossary records, by `glossaryKey`. */
  private readonly terms: Map<string, GlossaryEntry>;
  /** Problems with the core records and `faction.md` files. */
  private readonly headErrors: FileErrors[];
  /** Each folder's other files, not read yet. */
  private readonly folders: Map<string, Placed[]>;
  private readonly read = new Map<string, Contents>();

  private constructor(
    records: FactionRecord[],
    muster: Muster | undefined,
    glossary: GlossaryEntry[],
    headErrors: FileErrors[],
    folders: Map<string, Placed[]>,
  ) {
    this.muster = muster;
    this.terms = new Map(glossary.map((e) => [glossaryKey(e.term), e]));
    this.headErrors = headErrors;
    this.folders = folders;
    this.factions = records.map((r) => this.lazyFaction(r)).sort(byName);
  }

  /** Every problem found in the files. Reads every faction's files. */
  get errors(): FileErrors[] {
    const ids = new Set(this.factions.map((f) => f.id));
    const folderErrors = [...this.folders.keys()].flatMap((b) => this.contents(b, ids.has(b)).errors);

    return [...this.headErrors, ...folderErrors].sort((a, b) => a.path.localeCompare(b.path));
  }

  /** A faction whose units and detachments are read from its folder when first used. */
  private lazyFaction(record: FactionRecord): Faction {
    const faction = { ...record } as Faction;

    for (const key of ['units', 'detachments'] as const) {
      Object.defineProperty(faction, key, {
        enumerable: true,
        get: () => this.contents(record.id, true)[key],
      });
    }

    return faction;
  }

  private contents(bundle: string, hasFaction: boolean): Contents {
    const known = this.read.get(bundle);

    if (known) return known;

    const contents = readContents(this.folders.get(bundle) ?? [], hasFaction);

    this.read.set(bundle, contents);

    return contents;
  }

  /**
   * How many datasheets a faction folder holds, without reading them: the files whose frontmatter says `kind: unit`.
   * Once the faction is read, the datasheets it kept.
   */
  unitCount(factionId: string): number {
    const known = this.read.get(factionId);

    if (known) return known.units.length;

    return (this.folders.get(factionId) ?? []).filter((f) => UNIT_KIND.test(f.source)).length;
  }

  /** Every explained rule term, sorted by term. */
  get glossary(): GlossaryEntry[] {
    return [...this.terms.values()].sort((a, b) => a.term.localeCompare(b.term));
  }

  /** What a rule term means (`SUSTAINED HITS 2`, `Feel No Pain 4+`), or undefined when no glossary explains it. */
  explain(term: string): GlossaryEntry | undefined {
    return this.terms.get(glossaryKey(term));
  }

  static fromFiles(files: RulesFile[]): Library {
    const errors: FileErrors[] = [];
    const head: Placed[] = [];
    const folders = new Map<string, Placed[]>();

    for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
      const where = recordPath(file.path);

      if (!where) {
        errors.push({ path: file.path, errors: ['rules files must sit directly in a folder: <faction>/<file>.md'] });
        continue;
      }

      const placed = { ...file, ...where };

      if (where.bundle === CORE_BUNDLE || isFactionFile(file.path)) head.push(placed);
      else folders.set(where.bundle, [...(folders.get(where.bundle) ?? []), placed]);
    }

    const parsed = readPlaced(head, errors);
    const records = parsed.flatMap((p) => (p.record.kind === 'faction' ? [{ ...p.record, id: p.bundle }] : []));
    const musters = parsed.flatMap((p) => (p.record.kind === 'muster' ? [p] : []));

    for (const extra of musters.slice(1)) errors.push({ path: extra.path, errors: ['only one muster record is used'] });

    const glossary = parsed.flatMap((p) => (p.record.kind === 'glossary' ? p.record.entries : []));

    return new Library(records, musters[0]?.record as Muster | undefined, glossary, errors, folders);
  }

  faction(id: string): Faction | undefined {
    return this.factions.find((f) => f.id === id);
  }

  /**
   * A faction followed by every faction it includes, directly or through another, each once, with the ids each
   * including faction excludes.
   */
  private lineage(factionId: string): { faction: Faction; excluded: Set<string> }[] {
    const found: { faction: Faction; excluded: Set<string> }[] = [];

    const visit = (id: string, excluded: Set<string>) => {
      const faction = this.faction(id);

      if (!faction || found.some((f) => f.faction.id === id)) return;

      found.push({ faction, excluded });

      const next = new Set([...excluded, ...faction.excludes]);

      for (const parent of faction.includes) visit(parent, next);
    };

    visit(factionId, new Set());

    return found;
  }

  /** Records an army of this faction can use: its own, then those of the factions it includes, sorted by name. */
  private armyRecords<T extends { id: string; name: string }>(factionId: string, pick: (f: Faction) => T[]): T[] {
    const byId = new Map<string, T>();

    for (const { faction, excluded } of this.lineage(factionId)) {
      for (const record of pick(faction)) {
        if (!byId.has(record.id) && !excluded.has(record.id)) byId.set(record.id, record);
      }
    }

    return [...byId.values()].sort(byName);
  }

  /** Datasheets an army of this faction can take: its own and those of the factions it includes. */
  armyUnits(factionId: string): Unit[] {
    return this.armyRecords(factionId, (f) => f.units);
  }

  /** Detachments an army of this faction can take: its own and those of the factions it includes. */
  armyDetachments(factionId: string): Detachment[] {
    return this.armyRecords(factionId, (f) => f.detachments);
  }

  /**
   * A datasheet an army of this faction can take, with the faction it belongs to (an included one for shared
   * datasheets).
   */
  unit(factionId: string, unitId: string): { faction: Faction; unit: Unit } | undefined {
    for (const { faction, excluded } of this.lineage(factionId)) {
      const unit = excluded.has(unitId) ? undefined : faction.units.find((u) => u.id === unitId);

      if (unit) return { faction, unit };
    }

    return undefined;
  }

  /** A detachment an army of this faction can take, with the faction it belongs to. */
  detachment(factionId: string, detachmentId: string): { faction: Faction; detachment: Detachment } | undefined {
    for (const { faction, excluded } of this.lineage(factionId)) {
      const detachment = excluded.has(detachmentId)
        ? undefined
        : faction.detachments.find((d) => d.id === detachmentId);

      if (detachment) return { faction, detachment };
    }

    return undefined;
  }

  /** Factions that include this one, directly or through another. */
  includedBy(factionId: string): Faction[] {
    return this.factions.filter(
      (f) => f.id !== factionId && this.lineage(f.id).some((l) => l.faction.id === factionId),
    );
  }
}
