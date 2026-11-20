import type { Faction } from '@rulebook/rules';
import { useContext } from 'react';
import { Link } from 'react-router';

import { LibraryContext } from '../../library/LibraryContext';
import Markdown from '../common/Markdown';
import SectionPanel from './SectionPanel';

interface Props {
  title: string;
  faction: Faction;
  bodyguards: string[];
  notes?: string;
}

/**
 * The Leader or Support block: which units this one can join, linking to them, plus any notes. A shared datasheet can
 * name units of the factions that include its own (a chapter's units), which link to that faction.
 */
export default function AttachPanel({ title, faction, bodyguards, notes }: Props) {
  const library = useContext(LibraryContext);
  const owners = [faction, ...(library?.includedBy(faction.id) ?? [])];

  return (
    <SectionPanel title={title}>
      <p className="mb-1.5">This unit can be attached to:</p>
      <ul className="mb-1.5 list-[square] pl-5">
        {bodyguards.map((id) => {
          const owner = owners.find((f) => f.units.some((u) => u.id === id));
          const unit = owner?.units.find((u) => u.id === id);

          return (
            <li key={id}>
              {owner && unit ? (
                <Link to={`/${owner.id}/${id}`} className="font-semibold underline">
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
