import type { ArmyList, Library } from '@rulebook/rules';

import { useShowCoreStratagems } from '../../hooks/useShowCoreStratagems';
import { stratagemGroups } from '../../utils/stratagemGroups';
import EyeIcon from '../EyeIcon';
import StratagemTile from './StratagemTile';

/**
 * The army's stratagems in the play view: the core ones (hidden until shown with the eye) and each chosen detachment's,
 * coloured by turn.
 */
export default function PlayStratagems({ list, library }: { list: ArmyList; library: Library }) {
  const [showCore, setShowCore] = useShowCoreStratagems();
  const groups = stratagemGroups(list, library);

  if (!groups.length) return <p className="text-text/70">No stratagems loaded for this army.</p>;

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section key={g.title} className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-lg font-bold tracking-wide uppercase">
            {g.title}
            {g.core && (
              <button
                type="button"
                aria-pressed={showCore}
                aria-label={showCore ? 'Hide core stratagems' : 'Show core stratagems'}
                title={showCore ? 'Hide core stratagems' : 'Show core stratagems'}
                className="rounded p-1 text-text/70 hover:bg-white/10 hover:text-text"
                onClick={() => setShowCore(!showCore)}
              >
                <EyeIcon closed={!showCore} />
              </button>
            )}
          </h3>
          {(!g.core || showCore) && (
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {g.stratagems.map((s) => (
                <StratagemTile key={s.id} stratagem={s} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
