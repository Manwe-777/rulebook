import type { Unit } from '@rulebook/rules';

import Markdown from '../common/Markdown';
import SectionPanel from './SectionPanel';

function NamedList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <p className="dotted-rule mb-2 pb-2">
      {label}: <strong className="font-bold">{items.join(', ')}</strong>
    </p>
  );
}

export default function AbilitiesPanel({ unit }: { unit: Unit }) {
  const { coreAbilities, factionAbilities, sections } = unit;

  if (!coreAbilities.length && !factionAbilities.length && !sections.abilities && !sections.wargearAbilities) {
    return null;
  }

  return (
    <SectionPanel title="Abilities">
      <NamedList label="CORE" items={coreAbilities} />
      <NamedList label="FACTION" items={factionAbilities} />
      {sections.abilities && <Markdown>{sections.abilities}</Markdown>}
      {sections.wargearAbilities && (
        <div className="dotted-rule mt-2 pt-2">
          <p className="mb-1 font-bold uppercase">Wargear abilities</p>
          <Markdown>{sections.wargearAbilities}</Markdown>
        </div>
      )}
    </SectionPanel>
  );
}
