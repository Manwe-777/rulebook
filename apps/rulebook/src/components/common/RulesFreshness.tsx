import { useContext } from 'react';

import { useNow } from '../../hooks/useNow';
import { useReleases } from '../../hooks/useReleases';
import { SourceContext } from '../../library/SourceContext';
import { rulesFreshness } from '../../utils/rulesFreshness';

const DOT = { good: 'bg-emerald-400', pending: 'animate-pulse bg-amber-300', bad: 'bg-red-400', muted: 'bg-text/40' };

/** One line on how current the rules data is: where it comes from and when the relays last gave it. */
export default function RulesFreshness() {
  const status = useContext(SourceContext);
  const { checkedAt } = useReleases();
  const { tone, text } = rulesFreshness(status, checkedAt, useNow());

  return (
    <p className="flex items-center gap-2 text-sm text-text/80">
      <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${DOT[tone]}`} />
      {text}
    </p>
  );
}
