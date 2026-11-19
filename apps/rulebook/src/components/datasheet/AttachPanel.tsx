import type { Faction } from '@rulebook/rules';
import { Link } from 'react-router';

import Markdown from '../common/Markdown';
import SectionPanel from './SectionPanel';

interface Props {
  title: string;
  faction: Faction;
  bodyguards: string[];
  notes?: string;
}

/** The Leader or Support block: which units this one can join, linking to them, plus any notes. */
export default function AttachPanel({ title, faction, bodyguards, notes }: Props) {
  return (
    <SectionPanel title={title}>
      <p className="mb-1.5">This unit can be attached to:</p>
      <ul className="mb-1.5 list-[square] pl-5">
        {bodyguards.map((id) => {
          const unit = faction.units.find((u) => u.id === id);

          return (
            <li key={id}>
              {unit ? (
                <Link to={`/${faction.id}/${id}`} className="font-semibold underline">
                  {unit.name}
                </Link>
              ) : (
                id
              )}
            </li>
          );
        })}
      </ul>
      {notes && <Markdown>{notes}</Markdown>}
    </SectionPanel>
  );
}
