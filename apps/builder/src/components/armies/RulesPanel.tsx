import type { Library } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

import type { BuilderSource } from '../../hooks/useBuilderLibrary';
import { formatAgo } from '../../utils/formatAgo';
import { rulesFreshness } from '../../utils/rulesFreshness';
import { PANEL, PANEL_TITLE } from '../styles';

const DOT = { good: 'bg-emerald-400', pending: 'animate-pulse bg-amber-300', bad: 'bg-red-400', muted: 'bg-text/40' };

interface Props {
  library: Library;
  releases: ReleaseInfo[];
  status: BuilderSource;
  checkedAt: number | null;
  now: number;
}

/** How current the rules are: the relay check, and the release each faction (and the core rules) is on. */
export default function RulesPanel({ library, releases, status, checkedAt, now }: Props) {
  const freshness = rulesFreshness(status, checkedAt, now);

  const rows = [
    ...library.factions.map((f) => ({ id: f.id, name: f.name })),
    ...(library.muster ? [{ id: 'core', name: 'Core rules' }] : []),
  ];

  return (
    <section className={PANEL}>
      <h2 className={PANEL_TITLE}>Rules data</h2>
      <div className="flex flex-col gap-2 p-3">
        <p className="flex items-center gap-2 text-sm">
          <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${DOT[freshness.tone]}`} />
          {freshness.text}
        </p>
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-wide text-text/60 uppercase">
            <tr>
              <th className="py-1 font-semibold">Faction</th>
              <th className="py-1 font-semibold">Version</th>
              <th className="py-1 font-semibold">Released</th>
              <th className="py-1 text-right font-semibold">Records</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, name }) => {
              const release = releases.find((r) => r.faction === id);

              return (
                <tr key={id} className="border-t border-white/10" title={release?.notes || undefined}>
                  <td className="py-1 font-semibold">{name}</td>
                  <td className="py-1">{release?.version ?? 'Built-in demo'}</td>
                  <td className="py-1 text-text/70">{release ? formatAgo(Date.parse(release.date), now) : '—'}</td>
                  <td className="py-1 text-right text-text/70">{release?.records ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
