import { useLibrary } from '../../hooks/useLibrary';
import { turnStyle } from '../../utils/turnStyle';
import StratagemCard from '../detachment/StratagemCard';

const TURNS = ['your', 'opponent', 'either'] as const;

/** The core stratagems every army can use, with the key to their colours. */
export default function CoreStratagemsPage() {
  const stratagems = useLibrary().muster?.stratagems ?? [];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold tracking-wide uppercase">Core stratagems</h2>
      <p className="flex flex-wrap gap-2 text-sm font-semibold uppercase">
        {TURNS.map((t) => (
          <span key={t} className={`rounded px-2 py-0.5 text-white ${turnStyle(t).bar}`}>
            {turnStyle(t).label}
          </span>
        ))}
      </p>
      {stratagems.length ? (
        <ul className="grid gap-3 rounded-lg bg-parchment p-4 text-ink md:grid-cols-2">
          {stratagems.map((s) => (
            <StratagemCard key={s.id} stratagem={s} />
          ))}
        </ul>
      ) : (
        <p className="text-text/70">The core rules loaded have no stratagems.</p>
      )}
    </div>
  );
}
