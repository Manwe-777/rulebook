import { type Stratagem, stratagemTurn } from '@rulebook/rules';

import { turnStyle } from '../../utils/turnStyle';
import RulesText from '../unit/RulesText';

/** A stratagem in the play view, in the colour of the turn it is used in. */
export default function StratagemTile({ stratagem }: { stratagem: Stratagem }) {
  const turn = turnStyle(stratagemTurn(stratagem));

  return (
    <li className={`overflow-hidden rounded-lg border-2 bg-panel ${turn.border}`}>
      <div className={`flex items-center justify-between gap-3 px-3 py-1 text-white ${turn.bar}`}>
        <span className="font-bold tracking-wide uppercase">{stratagem.name}</span>
        <span className="shrink-0 font-extrabold">{stratagem.cp}CP</span>
      </div>
      <div className="px-3 py-2 text-sm leading-snug">
        <p className="mb-1 text-xs font-bold tracking-wide text-text/70 uppercase">
          {[stratagem.category, turn.label].filter(Boolean).join(' · ')}
        </p>
        {stratagem.text && <RulesText>{stratagem.text}</RulesText>}
      </div>
    </li>
  );
}
