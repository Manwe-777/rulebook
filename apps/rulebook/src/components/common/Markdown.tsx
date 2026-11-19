import ReactMarkdown, { type Components } from 'react-markdown';

/** Inline code is how rule files mark keywords, e.g. `` `[LETHAL HITS]` `` or `` `INFANTRY` ``. */
const COMPONENTS: Components = {
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 bg-bar px-3 py-1 text-lg font-bold tracking-wide text-white uppercase first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mt-3 mb-1 font-bold tracking-wide uppercase">{children}</h3>,
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  ul: ({ children }) => <ul className="mb-1.5 list-[square] pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-1.5 list-decimal pl-5 last:mb-0">{children}</ol>,
  code: ({ children }) => <span className="font-mono text-[0.85em] uppercase">{children}</span>,
  a: ({ href, children }) => (
    <a href={href} className="underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

/** Renders a unit file's Markdown. Raw HTML is not allowed, so uploaded files can't inject markup. */
export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={COMPONENTS}>{children}</ReactMarkdown>;
}
