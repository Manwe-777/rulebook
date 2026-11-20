import { groupEntries, type Library, type ListEntry } from '@rulebook/rules';

import type { ArmyDraft } from '../../army/ArmyDraft';
import { useUnitRoute } from '../../hooks/useUnitRoute';
import { entryItems } from '../../utils/entryItems';
import PlayMember from './PlayMember';

interface Props {
  draft: ArmyDraft;
  library: Library;
  points: Record<string, number>;
}

/**
 * The army for playing: one card per unit or combined unit, with nothing that changes the list. Tapping a card opens
 * that unit's full play view.
 */
export default function PlayList({ draft, library, points }: Props) {
  const [, openUnit] = useUnitRoute();
  const { list } = draft;

  const member = (entry: ListEntry, role?: string) => {
    const unit = library.unit(list.faction, entry.unit)?.unit;

    return unit ? (
      <PlayMember
        key={entry.id}
        faction={list.faction}
        entry={entry}
        unit={unit}
        points={points[entry.id] ?? 0}
        items={entryItems(library, list, entry)}
        warlord={list.warlord === entry.id}
        role={role}
      />
    ) : null;
  };

  if (!list.units.length) return <p className="text-text/70">This army has no units yet.</p>;

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {groupEntries(list).map(({ unit, attached }) => {
        const role = (e: ListEntry) => (library.unit(list.faction, e.unit)?.unit.leader ? 'Leader' : 'Support');
        const total = [unit, ...attached].reduce((sum, e) => sum + (points[e.id] ?? 0), 0);

        return (
          <li key={unit.id}>
            <button
              type="button"
              className="flex w-full flex-col divide-y divide-white/10 overflow-hidden rounded-lg bg-panel text-left shadow-lg ring-bar hover:ring-2"
              onClick={() => openUnit(unit.id)}
            >
              {attached.length > 0 && (
                <span className="bg-bar px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
                  Combined unit · {total} pts
                </span>
              )}
              {member(unit)}
              {attached.map((e) => member(e, role(e)))}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
