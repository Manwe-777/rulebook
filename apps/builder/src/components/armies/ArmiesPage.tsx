import type { Library } from '@rulebook/rules';

import type { SavedArmies } from '../../army/SavedArmies';
import { useNow } from '../../hooks/useNow';
import { PANEL, PANEL_TITLE } from '../styles';
import ArmyCard from './ArmyCard';
import NewArmyForm from './NewArmyForm';

interface Props {
  saved: SavedArmies;
  library: Library;
  onOpen: (id: string) => void;
  onCreate: (faction: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Every army saved on this device, newest first, and a form to start a new one. */
export default function ArmiesPage({ saved, library, onOpen, onCreate, onDuplicate, onDelete }: Props) {
  const now = useNow();

  return (
    <div className="flex flex-col gap-4">
      <section className={PANEL}>
        <h2 className={PANEL_TITLE}>Start an army</h2>
        <div className="p-3">
          <NewArmyForm library={library} onCreate={onCreate} />
        </div>
      </section>
      {saved.size === 0 ? (
        <p className="text-text/70">No armies yet. Pick a faction above to start one.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {saved.all.map((army) => (
            <ArmyCard
              key={army.id}
              army={army}
              library={library}
              now={now}
              onOpen={() => onOpen(army.id)}
              onDuplicate={() => onDuplicate(army.id)}
              onDelete={() => onDelete(army.id)}
            />
          ))}
        </ul>
      )}
      <p className="text-xs text-text/60">Armies and photos are saved on this device only.</p>
    </div>
  );
}
