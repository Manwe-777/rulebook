import { Link } from 'react-router';

import { useConnectionSummary } from '../../hooks/useConnectionSummary';
import type { ConnectionSummary } from '../../identity/connectionSummary';

const DOT: Record<ConnectionSummary['tone'], string> = {
  good: 'bg-emerald-400',
  pending: 'animate-pulse bg-amber-300',
  bad: 'bg-red-400',
  muted: 'bg-text/40',
};

/** Relay link and signing state in the page header; links to the account page. */
export default function ConnectionBadge() {
  const { tone, label, detail } = useConnectionSummary();

  return (
    <Link
      to="/account"
      title={detail}
      className="flex items-center gap-2 rounded-full border border-text/20 px-3 py-1 text-sm font-semibold hover:bg-text/10"
    >
      <span aria-hidden className={`size-2.5 rounded-full ${DOT[tone]}`} />
      <span>{label}</span>
      <span className="hidden font-normal text-text/70 md:inline">· {detail}</span>
    </Link>
  );
}
