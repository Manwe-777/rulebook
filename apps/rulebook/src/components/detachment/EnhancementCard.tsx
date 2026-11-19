import type { Enhancement } from '@rulebook/rules';

import { eligibilityText } from '../../utils/eligibilityText';
import Markdown from '../common/Markdown';

export default function EnhancementCard({ enhancement }: { enhancement: Enhancement }) {
  return (
    <li className="dotted-rule pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-bold tracking-wide uppercase">
          {enhancement.name}
          {enhancement.target === 'unit' && <span className="ml-2 text-xs font-semibold text-ink-muted">Upgrade</span>}
        </h4>
        <span className="shrink-0 font-semibold">{enhancement.points} pts</span>
      </div>
      <p className="mb-1 text-sm font-semibold text-ink-muted uppercase">{eligibilityText(enhancement)}</p>
      {enhancement.text && <Markdown>{enhancement.text}</Markdown>}
    </li>
  );
}
