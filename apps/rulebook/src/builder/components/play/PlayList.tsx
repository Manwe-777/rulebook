import { groupEntries, type Library, type ListEntry } from '@rulebook/rules';

import type { ArmyDraft } from '../../army/ArmyDraft';
import { useUnitRoute } from '../../hooks/useUnitRoute';
import { entryItems } from '../../utils/entryItems';
import CollapseButton from '../CollapseButton';
import PlayMember from './PlayMember';

interface Props {
  draft: ArmyDraft;
  library: Library;
  points: Record<string, number>;
  /** Units folded down to their title. */
  collapsed: ReadonlySet<string>;
  onToggle: (entry: string) => void;
}

/**
 * The army for playing: one card per unit or combined unit, with nothing that changes the list. Tapping a card opens
 * that unit's full play view; the chevron folds it down to its title, for units lost during the game.
 */
export default function PlayList({ draft, library, points, collapsed, onToggle }: Props) {
  const [, openUnit] = useUnitRoute();
  const { list } = draft;

  const member = (entry: ListEntry, role?: string) => {
    const unit = library.unit(list.faction, entry.unit)?.unit;

    if (!unit) return null;

    const folded = collapsed.has(entry.id);

    return (
      <div key={entry.id} className={`flex items-start ${folded ? 'opacity-60' : ''}`}>
        <button type="button" className="min-w-0 flex-1 text-left hover:bg-white/5" onClick={() => openUnit(entry.id)}>
          <PlayMember
            faction={list.faction}
            entry={entry}
            unit={unit}
            points={points[entry.id] ?? 0}
            items={entryItems(library, list, entry)}
            warlord={list.warlord === entry.id}
            role={role}
            collapsed={folded}
          />
        </button>
        <CollapseButton
          name={unit.name}
          collapsed={folded}
          onToggle={() => onToggle(entry.id)}
          className="m-1 text-text/70 hover:bg-white/10"
        />
      </div>
    );
  };

  if (!list.units.length) return <p className="text-text/70">This army has no units yet.</p>;

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {groupEntries(list).map(({ unit, attached }) => {
        const role = (e: ListEntry) => (library.unit(list.faction, e.unit)?.unit.leader ? 'Leader' : 'Support');
        const total = [unit, ...attached].reduce((sum, e) => sum + (points[e.id] ?? 0), 0);

        return (
          <li key={unit.id}>
            <div className="flex w-full flex-col divide-y divide-white/10 overflow-hidden rounded-lg bg-panel shadow-lg">
              {attached.length > 0 && (
                <span className="bg-bar px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
                  Combined unit · {total} pts
                </span>
              )}
              {member(unit)}
              {attached.map((e) => member(e, role(e)))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
