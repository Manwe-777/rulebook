import { lineDiff } from '../../editor/lineDiff';

const STYLE = {
  same: 'text-ink-muted',
  added: 'bg-green-200 text-green-950',
  removed: 'bg-red-200 text-red-950 line-through',
};

const MARK = { same: ' ', added: '+', removed: '-' };

/** Changed lines between two record texts, with a few unchanged lines kept for context. */
export default function DiffView({ before, after }: { before: string; after: string }) {
  const lines = lineDiff(before, after);
  const near = (i: number) => lines.slice(Math.max(0, i - 2), i + 3).some((l) => l.type !== 'same');

  return (
    <pre className="max-h-96 overflow-auto rounded bg-white/70 p-2 text-xs">
      {lines.map((line, i) =>
        near(i) ? (
          <div key={i} className={STYLE[line.type]}>
            {MARK[line.type]} {line.text}
          </div>
        ) : null,
      )}
    </pre>
  );
}
