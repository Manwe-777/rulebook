import ReactMarkdown, { type Components } from 'react-markdown';

const COMPONENTS: Components = {
  h3: ({ children }) => <h4 className="mt-2 font-bold uppercase">{children}</h4>,
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  ul: ({ children }) => <ul className="mb-1.5 list-[square] pl-5 last:mb-0">{children}</ul>,
  code: ({ children }) => <span className="font-mono text-[0.85em] uppercase">{children}</span>,
};

/** Rules text from a record. Raw HTML is not allowed, so relay content can't inject markup. */
export default function RulesText({ children }: { children: string }) {
  return <ReactMarkdown components={COMPONENTS}>{children}</ReactMarkdown>;
}
