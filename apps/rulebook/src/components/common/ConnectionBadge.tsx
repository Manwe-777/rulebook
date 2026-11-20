import { lazy, Suspense, useState } from 'react';

import { useConnectionSummary } from '../../hooks/useConnectionSummary';
import type { ConnectionSummary } from '../../identity/connectionSummary';

// The relay list reads the relays when opened, so it loads only then.
const ConnectionDialog = lazy(() => import('../connection/ConnectionDialog'));

const DOT: Record<ConnectionSummary['tone'], string> = {
  good: 'bg-emerald-400',
  pending: 'animate-pulse bg-amber-300',
  bad: 'bg-red-400',
  muted: 'bg-text/40',
};

/** Relay link and signing state in the page header; opens the connection details and the relay list. */
export default function ConnectionBadge() {
  const { tone, label, detail } = useConnectionSummary();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title={detail}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-full border border-text/20 px-3 py-1 text-sm font-semibold hover:bg-text/10"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden className={`size-2.5 rounded-full ${DOT[tone]}`} />
        <span>{label}</span>
        <span className="hidden font-normal text-text/70 md:inline">· {detail}</span>
      </button>
      {open && (
        <Suspense fallback={null}>
          <ConnectionDialog onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
