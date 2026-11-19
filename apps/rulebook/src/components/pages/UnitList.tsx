import type { Faction } from '@rulebook/rules';

import LinkRow from '../common/LinkRow';
import { LIST_HEADING } from '../common/styles';

/** The faction's datasheets, linking to each unit page. */
export default function UnitList({ faction }: { faction: Faction }) {
  return (
    <section>
      <h2 className={LIST_HEADING}>Datasheets</h2>
      <ul>
        {faction.units.map((u) => (
          <LinkRow key={u.id} to={`/${faction.id}/${u.id}`} name={u.name} note={u.subtitle} />
        ))}
      </ul>
    </section>
  );
}
