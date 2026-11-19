import type { Unit } from '@rulebook/rules';

import { wargearOptionLines } from '../../utils/wargearOptionLines';
import Markdown from '../common/Markdown';
import SectionPanel from './SectionPanel';

export default function WargearPanel({ unit }: { unit: Unit }) {
  const lines = wargearOptionLines(unit);
  const notes = unit.sections.wargearOptions;

  if (!lines.length && !notes) return null;

  return (
    <SectionPanel title="Wargear options">
      {lines.length > 0 && (
        <ul className="mb-1.5 list-[square] pl-5">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {notes && <Markdown>{notes}</Markdown>}
    </SectionPanel>
  );
}
