import type { Library } from '@rulebook/rules';

import Markdown from '../common/Markdown';
import Datasheet from '../datasheet/Datasheet';
import EnhancementCard from '../detachment/EnhancementCard';
import StratagemCard from '../detachment/StratagemCard';

interface Props {
  library: Library;
  faction: string;
  kind: string;
  id: string;
}

/** How the edited record will look, rendered from the library with the change applied. */
export default function RecordPreview({ library, faction, kind, id }: Props) {
  const unit = kind === 'unit' ? library.unit(faction, id) : undefined;
  const detachment = kind === 'detachment' ? library.detachment(faction, id)?.detachment : undefined;
  const factionRecord = kind === 'faction' ? library.faction(faction) : undefined;

  if (unit) return <Datasheet unit={unit.unit} faction={unit.faction} />;
  if (factionRecord) return <Markdown>{factionRecord.body}</Markdown>;
  if (!detachment) return <p className="text-ink-muted">Fix the errors to see a preview.</p>;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-2xl font-extrabold uppercase">{detachment.name}</h3>
      {detachment.sections.rule && <Markdown>{detachment.sections.rule}</Markdown>}
      <ul className="flex flex-col gap-3">
        {detachment.enhancements.map((e) => (
          <EnhancementCard key={e.id} enhancement={e} />
        ))}
      </ul>
      <ul className="flex flex-col gap-3">
        {detachment.stratagems.map((s) => (
          <StratagemCard key={s.id} stratagem={s} />
        ))}
      </ul>
    </div>
  );
}
