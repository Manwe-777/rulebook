import type { ArmyList, Library } from '@rulebook/rules';

import { stratagemGroups } from '../../utils/stratagemGroups';
import StratagemTile from './StratagemTile';

/** The army's stratagems in the play view: the core ones and each chosen detachment's, coloured by turn. */
export default function PlayStratagems({ list, library }: { list: ArmyList; library: Library }) {
  const groups = stratagemGroups(list, library);

  if (!groups.length) return <p className="text-text/70">No stratagems loaded for this army.</p>;

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section key={g.title} className="flex flex-col gap-2">
          <h3 className="text-lg font-bold tracking-wide uppercase">{g.title}</h3>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {g.stratagems.map((s) => (
              <StratagemTile key={s.id} stratagem={s} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
