import { type ReactNode, useContext, useId } from 'react';

import { LibraryContext } from '../../library/LibraryContext';
import Markdown from './Markdown';

/**
 * A rule term (weapon ability, core ability) that opens its glossary explanation when tapped. Without an explanation
 * it is plain text.
 */
export default function RuleTerm({ term, children }: { term: string; children?: ReactNode }) {
  const entry = useContext(LibraryContext)?.explain(term);
  const id = useId();

  if (!entry) return <>{children ?? term}</>;

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        className="cursor-help underline decoration-dotted underline-offset-2 hover:decoration-solid"
      >
        {children ?? term}
      </button>
      <div
        id={id}
        popover="auto"
        className="m-auto max-w-sm rounded-lg bg-parchment p-0 font-sans text-base text-ink normal-case shadow-2xl backdrop:bg-black/40"
      >
        <p className="bg-bar px-3 py-1.5 font-bold tracking-wide text-white uppercase">{entry.term}</p>
        <div className="px-3 py-2">
          <Markdown>{entry.text}</Markdown>
        </div>
      </div>
    </>
  );
}
