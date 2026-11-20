import type { Library } from '@rulebook/rules';
import { useId } from 'react';

import RulesText from './RulesText';

/** A rule term that opens its glossary explanation when tapped; plain text when the glossary doesn't have it. */
export default function RuleTerm({ library, term }: { library: Library; term: string }) {
  const entry = library.explain(term);
  const id = useId();

  if (!entry) return <>{term}</>;

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        className="cursor-help uppercase underline decoration-dotted underline-offset-2 hover:decoration-solid"
      >
        {term}
      </button>
      <div
        id={id}
        popover="auto"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg bg-panel p-0 text-left font-sans text-lg font-normal tracking-normal whitespace-normal text-text normal-case shadow-2xl backdrop:bg-black/50"
      >
        <p className="bg-bar px-4 py-2 text-xl font-bold tracking-wide text-white uppercase">{entry.term}</p>
        <div className="px-4 py-3">
          <RulesText>{entry.text}</RulesText>
        </div>
      </div>
    </>
  );
}
