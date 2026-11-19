import type { Unit } from '@rulebook/rules';

import type { FactionTheme } from '../../types';
import FactionIcon from '../icons/FactionIcon';

export default function KeywordsFooter({ unit, theme }: { unit: Unit; theme: FactionTheme }) {
  return (
    <footer className="relative grid border-2 border-bar text-xs md:grid-cols-[3fr_2fr]">
      <div className="bg-parchment-dark/70 px-3 py-3">
        KEYWORDS: <span className="font-mono text-[0.8rem] uppercase">{unit.keywords.join('; ')}</span>
      </div>
      <div className="flex items-center gap-3 bg-bar-dark px-3 py-2 text-white md:pl-14">
        <div>
          FACTION KEYWORDS:
          <div className="font-mono text-[0.8rem] uppercase">{unit.factionKeywords.join('; ')}</div>
        </div>
      </div>
      {theme.icon && (
        <div className="diamond absolute top-1/2 left-[60%] hidden size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-parchment md:flex">
          <div className="diamond flex size-14 items-center justify-center bg-bar">
            <FactionIcon name={theme.icon} className="text-2xl text-parchment" />
          </div>
        </div>
      )}
    </footer>
  );
}
