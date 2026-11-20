import { CORE_BUNDLE, FACTION_FILE } from '../constants';
import { parseRecord } from '../parse/parseRecord';
import type { Detachment, Faction, FileErrors, GlossaryEntry, Muster, RulesFile, RulesRecord, Unit } from '../types';
import { glossaryKey } from '../utils/glossaryKey';
import { recordPath } from '../utils/recordPath';

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

interface Parsed {
  bundle: string;
  path: string;
  record: RulesRecord;
}

/** Where a record of each kind may sit, or why it can't sit there. */
function misplaced({ bundle, path, record }: Parsed): string | null {
  const isFactionFile = path.replace(/\\/g, '/').endsWith(`/${FACTION_FILE}`) || path === FACTION_FILE;

  const core = record.kind === 'muster' || record.kind === 'glossary';

  if (bundle === CORE_BUNDLE) return core ? null : `the ${CORE_BUNDLE} folder only holds muster and glossary records`;
  if (core) return `${record.kind} records belong in the ${CORE_BUNDLE} folder`;
  if (isFactionFile !== (record.kind === 'faction'))
    return `${FACTION_FILE} holds the faction record, and only it does`;

  return null;
}

/**
 * Every faction read from a set of rules files, the core muster rules, and the problems found. A faction is a folder
 * holding a `faction.md` and one file per unit or detachment; the `core` folder holds the muster rules. Files that
 * can't be used are left out and reported, never thrown.
 */
export class Library {
  readonly factions: Faction[];
  readonly muster: Muster | undefined;
  readonly errors: FileErrors[];
  /** Rule terms explained by the core glossary records, by `glossaryKey`. */
  private readonly terms: Map<string, GlossaryEntry>;

  private constructor(
    factions: Faction[],
    muster: Muster | undefined,
    glossary: GlossaryEntry[],
    errors: FileErrors[],
  ) {
    this.factions = factions;
    this.muster = muster;
    this.terms = new Map(glossary.map((e) => [glossaryKey(e.term), e]));
    this.errors = errors;
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
    const parsed: Parsed[] = [];

    for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
      const where = recordPath(file.path);

      if (!where) {
        errors.push({ path: file.path, errors: ['rules files must sit directly in a folder: <faction>/<file>.md'] });
        continue;
      }

      const result = parseRecord(file.source, file.path, where.name);

      if (!result.ok) errors.push({ path: result.path, errors: result.errors });
      else parsed.push({ bundle: where.bundle, path: file.path, record: result.value });
    }

    const placed = parsed.filter((p) => {
      const problem = misplaced(p);

      if (problem) errors.push({ path: p.path, errors: [problem] });

      return !problem;
    });

    const factions = Library.groupFactions(placed, errors);
    const musters = placed.flatMap((p) => (p.record.kind === 'muster' ? [p] : []));

    for (const extra of musters.slice(1)) errors.push({ path: extra.path, errors: ['only one muster record is used'] });

    errors.sort((a, b) => a.path.localeCompare(b.path));

    const glossary = placed.flatMap((p) => (p.record.kind === 'glossary' ? p.record.entries : []));

    return new Library(factions, musters[0]?.record as Muster | undefined, glossary, errors);
  }

  private static groupFactions(parsed: Parsed[], errors: FileErrors[]): Faction[] {
    const factions = new Map<string, Faction>();

    for (const { bundle, record } of parsed) {
      if (record.kind === 'faction') factions.set(bundle, { ...record, id: bundle, units: [], detachments: [] });
    }

    for (const item of parsed) {
      const problem = Library.addToFaction(factions.get(item.bundle), item);

      if (problem) errors.push({ path: item.path, errors: [problem] });
    }

    for (const faction of factions.values()) {
      faction.units.sort(byName);
      faction.detachments.sort(byName);
    }

    return [...factions.values()].sort(byName);
  }

  /** Adds a unit or detachment to its faction, or says why it can't be added. */
  private static addToFaction(faction: Faction | undefined, { bundle, record }: Parsed): string | null {
    if (record.kind === 'unit' || record.kind === 'detachment') {
      if (!faction) return `folder "${bundle}" has no ${FACTION_FILE}`;

      const list: { id: string }[] = record.kind === 'unit' ? faction.units : faction.detachments;

      if (list.some((r) => r.id === record.id)) return `id "${record.id}" is used twice`;

      list.push(record);
    }

    return null;
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
