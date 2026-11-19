import { detachmentTags, type Faction } from '@rulebook/rules';

import { useLibrary } from '../../hooks/useLibrary';
import LinkRow from '../common/LinkRow';
import { LIST_HEADING } from '../common/styles';

/** The faction's detachments, linking to each detachment page. */
export default function DetachmentList({ faction }: { faction: Faction }) {
  const { muster } = useLibrary();

  if (!faction.detachments.length) return null;

  return (
    <section>
      <h2 className={LIST_HEADING}>Detachments</h2>
      <ul>
        {faction.detachments.map((d) => (
          <LinkRow
            key={d.id}
            to={`/${faction.id}/detachment/${d.id}`}
            name={d.name}
            note={detachmentTags(d, muster).join(' · ')}
          />
        ))}
      </ul>
    </section>
  );
}
