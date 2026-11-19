import {
  type ArmyList,
  type Detachment,
  type Enhancement,
  type Faction,
  groupEntries,
  type Issue,
  type Library,
  type ListEntry,
  listPoints,
  type Unit,
  validateList,
} from '@rulebook/rules';

/** One unit as the roster prints it. */
export interface PrintEntry {
  id: string;
  name: string;
  models: number;
  points: number;
  /** Wargear taken, in words: `2× Melta gun (replacing Carbine)`. */
  wargear: string[];
  enhancement?: string;
  upgrade?: string;
  warlord: boolean;
}

/** A unit on its own, or a combined unit: attached leaders and support first, then the unit they join. */
export interface PrintGroup {
  entries: PrintEntry[];
  combined: boolean;
  points: number;
}

export interface PrintSheet {
  list: ArmyList;
  faction: Faction | undefined;
  battleSize: string;
  /** The army's force disposition by name: the one picked, or its only detachment's. */
  disposition: string | undefined;
  points: number;
  limit: number | null;
  detachments: Detachment[];
  groups: PrintGroup[];
  /** Each datasheet in the army once, in the order first added. */
  datasheets: Unit[];
  /** Enhancements and upgrades taken, with who carries them. */
  items: { item: Enhancement; bearer: string }[];
  errors: Issue[];
}

const weaponNames = (unit: Unit, ids: string[]) =>
  ids
    .map((id) => {
      const weapon = [...unit.ranged, ...unit.melee].find((w) => w.id === id);

      return weapon ? (weapon.group ?? weapon.name) : id;
    })
    .join(' + ');

function wargearText(unit: Unit | undefined, entry: ListEntry): string[] {
  if (!unit) return [];

  return entry.wargear.map((row) => {
    const option = unit.wargearOptions.find((o) => o.id === row.option);
    const replacing = option?.replace.length ? ` (replacing ${weaponNames(unit, option.replace)})` : '';

    return `${row.models}× ${weaponNames(unit, row.choice)}${replacing}`;
  });
}

/** The army's force disposition by name: the one picked, or its only detachment's. */
function dispositionName(list: ArmyList, detachments: Detachment[], library: Library): string | undefined {
  const id = list.disposition ?? (detachments.length === 1 ? detachments[0].disposition : undefined);

  return id ? (library.muster?.dispositions.find((d) => d.id === id)?.name ?? id) : undefined;
}

/** Everything the printable army sheet shows, worked out from the list and the rules. */
export function printSheet(list: ArmyList, library: Library): PrintSheet {
  const faction = library.faction(list.faction);
  const points = listPoints(list, library);
  const unitOf = (entry: ListEntry) => library.unit(list.faction, entry.unit)?.unit;
  const detachments = (faction?.detachments ?? []).filter((d) => list.detachments.includes(d.id));
  const disposition = dispositionName(list, detachments, library);

  const allItems = detachments.flatMap((d) => d.enhancements);
  const itemName = (id: string | undefined) => (id ? (allItems.find((e) => e.id === id)?.name ?? id) : undefined);

  const toPrint = (entry: ListEntry): PrintEntry => ({
    id: entry.id,
    name: unitOf(entry)?.name ?? entry.unit,
    models: entry.models,
    points: points.entries[entry.id] ?? 0,
    wargear: wargearText(unitOf(entry), entry),
    enhancement: itemName(entry.enhancement),
    upgrade: itemName(entry.upgrade),
    warlord: list.warlord === entry.id,
  });

  const groups = groupEntries(list).map(({ unit, attached }) => {
    const entries = [...attached, unit].map(toPrint);

    return { entries, combined: attached.length > 0, points: entries.reduce((sum, e) => sum + e.points, 0) };
  });

  const items = list.units.flatMap((entry) =>
    [entry.enhancement, entry.upgrade]
      .map((id) => allItems.find((e) => e.id === id))
      .filter((item) => item !== undefined)
      .map((item) => ({ item, bearer: unitOf(entry)?.name ?? entry.unit })),
  );

  const datasheets = [...new Set(list.units.map((e) => e.unit))]
    .map((id) => library.unit(list.faction, id)?.unit)
    .filter((u) => u !== undefined);

  return {
    list,
    faction,
    battleSize: library.muster?.battleSizes.find((b) => b.id === list.battleSize)?.name ?? list.battleSize,
    disposition,
    points: points.total,
    limit: points.limit,
    detachments,
    groups,
    datasheets,
    items,
    errors: validateList(list, library).filter((i) => i.severity === 'error'),
  };
}
