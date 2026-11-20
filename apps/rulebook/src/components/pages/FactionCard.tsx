import type { Faction } from '@rulebook/rules';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import { factionTheme } from '../../utils/factionTheme';
import FactionIcon from '../icons/FactionIcon';

export default function FactionCard({ faction, units }: { faction: Faction; units: number }) {
  const theme = factionTheme({}, faction);

  return (
    <Link
      to={`/${faction.id}`}
      className="sheet-camo group relative flex items-center gap-4 overflow-hidden rounded-lg p-4 shadow-lg transition hover:brightness-110"
      style={{ '--faction': theme.color } as CSSProperties}
    >
      <div className="sheet-band absolute inset-0 opacity-90" />
      <div className="relative flex size-14 shrink-0 items-center justify-center">
        {theme.icon && <FactionIcon name={theme.icon} className="text-5xl text-white/90" />}
      </div>
      <div className="relative">
        <div className="text-2xl font-extrabold tracking-wide uppercase">{faction.name}</div>
        <div className="text-sm text-white/75">
          {units} datasheet{units === 1 ? '' : 's'}
        </div>
      </div>
    </Link>
  );
}
