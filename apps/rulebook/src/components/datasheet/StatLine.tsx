import type { Profile } from '@rulebook/rules';
import { Fragment } from 'react';

import InvulnRow from './InvulnRow';
import StatBox from './StatBox';

const STATS = ['M', 'T', 'Sv', 'W', 'Ld', 'OC'] as const;

/** Stat boxes for every model profile. Profile names are shown only when the unit has more than one. */
export default function StatLine({ profiles }: { profiles: Profile[] }) {
  const named = profiles.length > 1;

  return (
    <div className="grid grid-cols-[repeat(6,2.5rem)_auto] items-center gap-x-2 gap-y-1.5 sm:grid-cols-[repeat(6,3rem)_auto] sm:gap-x-3">
      {STATS.map((s) => (
        <div key={s} className="-mb-1 text-center text-xs font-bold uppercase">
          {s}
        </div>
      ))}
      <div />
      {profiles.map((p) => (
        <Fragment key={p.name}>
          {STATS.map((s) => (
            <StatBox key={s} value={p[s]} />
          ))}
          <div className="pl-1 text-sm font-bold uppercase">{named ? p.name : ''}</div>
          {p.InSv && <InvulnRow value={p.InSv} />}
        </Fragment>
      ))}
    </div>
  );
}
