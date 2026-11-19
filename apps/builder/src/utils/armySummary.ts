import { type ArmyList, type Library, listPoints, validateList } from '@rulebook/rules';

export interface ArmySummary {
  faction: string;
  /** The faction's colour and icon from its data, when it sets them. */
  color: string | undefined;
  icon: string | undefined;
  battleSize: string;
  detachments: string[];
  points: number;
  limit: number | null;
  errors: number;
  units: number;
  /** Datasheet ids in the army, each once, in the order first added (for photos). */
  unitTypes: string[];
}

/** What the armies screen shows about a saved list, with names from the rules (ids when the rules aren't loaded). */
export function armySummary(list: ArmyList, library: Library): ArmySummary {
  const faction = library.faction(list.faction);
  const size = library.muster?.battleSizes.find((b) => b.id === list.battleSize);
  const points = listPoints(list, library);

  return {
    faction: faction?.name ?? list.faction,
    color: faction?.color,
    icon: faction?.icon,
    battleSize: size?.name ?? list.battleSize,
    detachments: list.detachments.map((id) => faction?.detachments.find((d) => d.id === id)?.name ?? id),
    points: points.total,
    limit: points.limit,
    errors: validateList(list, library).filter((i) => i.severity === 'error').length,
    units: list.units.length,
    unitTypes: [...new Set(list.units.map((e) => e.unit))],
  };
}
