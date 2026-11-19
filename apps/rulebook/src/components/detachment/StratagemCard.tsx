import type { Stratagem } from '@rulebook/rules';

import Markdown from '../common/Markdown';

export default function StratagemCard({ stratagem }: { stratagem: Stratagem }) {
  return (
    <li className="overflow-hidden rounded border-2 border-bar">
      <div className="flex items-center justify-between gap-3 bg-bar px-3 py-1 text-white">
        <h4 className="font-bold tracking-wide uppercase">{stratagem.name}</h4>
        <span className="shrink-0 font-extrabold">{stratagem.cp}CP</span>
      </div>
      <div className="px-3 py-2 text-[0.95rem] leading-snug">
        {stratagem.category && (
          <p className="mb-1 text-sm font-semibold text-ink-muted uppercase">{stratagem.category}</p>
        )}
        {stratagem.text && <Markdown>{stratagem.text}</Markdown>}
      </div>
    </li>
  );
}
