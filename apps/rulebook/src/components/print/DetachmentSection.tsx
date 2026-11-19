import type { Detachment, Enhancement } from '@rulebook/rules';

import Markdown from '../common/Markdown';
import SectionPanel from '../datasheet/SectionPanel';
import EnhancementCard from '../detachment/EnhancementCard';
import StratagemCard from '../detachment/StratagemCard';

interface Props {
  detachment: Detachment;
  /** Enhancements and upgrades from this detachment that the army took, with who carries them. */
  taken: { item: Enhancement; bearer: string }[];
  rules: boolean;
  stratagems: boolean;
}

/** A detachment's rule and the enhancements the army took from it, and/or its stratagems. */
export default function DetachmentSection({ detachment, taken, rules, stratagems }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-2xl font-extrabold uppercase">{detachment.name}</h3>
      {rules && detachment.sections.rule && (
        <SectionPanel title="Detachment rule">
          <Markdown>{detachment.sections.rule}</Markdown>
        </SectionPanel>
      )}
      {rules && taken.length > 0 && (
        <SectionPanel title="Enhancements taken">
          <ul className="flex flex-col gap-3">
            {taken.map(({ item, bearer }) => (
              <div key={`${item.id}-${bearer}`} className="break-inside-avoid">
                <p className="text-xs font-bold text-ink-muted uppercase">On {bearer}</p>
                <EnhancementCard enhancement={item} />
              </div>
            ))}
          </ul>
        </SectionPanel>
      )}
      {stratagems && detachment.stratagems.length > 0 && (
        <SectionPanel title="Stratagems">
          <ul className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
            {detachment.stratagems.map((s) => (
              <div key={s.id} className="break-inside-avoid">
                <StratagemCard stratagem={s} />
              </div>
            ))}
          </ul>
        </SectionPanel>
      )}
    </section>
  );
}
