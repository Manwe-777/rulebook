import type { Unit } from '@rulebook/rules';

import { compositionLines } from '../../utils/compositionLines';
import { equipmentLines } from '../../utils/equipmentLines';
import { pointsLines } from '../../utils/pointsLines';
import Markdown from '../common/Markdown';
import SectionPanel from './SectionPanel';

export default function CompositionPanel({ unit }: { unit: Unit }) {
  return (
    <SectionPanel title="Unit composition">
      <ul className="mb-2 list-[square] pl-5">
        {compositionLines(unit).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {equipmentLines(unit).map(({ model, items }) => (
        <p key={model} className="mb-1.5">
          <strong className="font-bold">{model}:</strong> {items}
        </p>
      ))}
      {unit.sections.unitComposition && <Markdown>{unit.sections.unitComposition}</Markdown>}
      <p className="dotted-rule mt-2 pt-2 font-semibold">{pointsLines(unit).join(' · ')}</p>
    </SectionPanel>
  );
}
