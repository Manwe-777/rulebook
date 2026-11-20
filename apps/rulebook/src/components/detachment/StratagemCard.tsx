import { type Stratagem, stratagemTurn } from '@rulebook/rules';

import { turnStyle } from '../../utils/turnStyle';
import Markdown from '../common/Markdown';

/** A stratagem in the colour of the turn it is used in, as codices print them. */
export default function StratagemCard({ stratagem }: { stratagem: Stratagem }) {
  const turn = turnStyle(stratagemTurn(stratagem));

  return (
    <li className={`overflow-hidden rounded border-2 ${turn.border}`}>
      <div className={`flex items-center justify-between gap-3 px-3 py-1 text-white ${turn.bar}`}>
        <h4 className="font-bold tracking-wide uppercase">{stratagem.name}</h4>
        <span className="shrink-0 font-extrabold">{stratagem.cp}CP</span>
      </div>
      <div className="px-3 py-2 text-[0.95rem] leading-snug">
        <p className="mb-1 text-sm font-semibold text-ink-muted uppercase">
          {[stratagem.category, turn.label].filter(Boolean).join(' · ')}
        </p>
        {stratagem.text && <Markdown>{stratagem.text}</Markdown>}
      </div>
    </li>
  );
}
