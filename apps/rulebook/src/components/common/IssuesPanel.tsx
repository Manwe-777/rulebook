import type { Issue } from '@rulebook/rules';

/** Lists problems found by the dataset checks: errors in red, warnings in amber. */
export default function IssuesPanel({ issues }: { issues: Issue[] }) {
  if (!issues.length) return null;

  const errors = issues.filter((i) => i.severity === 'error').length;

  return (
    <section className="rounded-lg border border-amber-400/40 bg-amber-950/50 p-4 text-sm text-amber-100">
      <h2 className="mb-2 font-bold uppercase">
        Data checks: {errors} error{errors === 1 ? '' : 's'}, {issues.length - errors} warning
        {issues.length - errors === 1 ? '' : 's'}
      </h2>
      <ul className="flex flex-col gap-1">
        {issues.map((i) => (
          <li key={`${i.code}-${i.entries.join()}-${i.message}`}>
            <span className={i.severity === 'error' ? 'font-bold text-red-300' : 'font-bold text-amber-300'}>
              {i.severity}
            </span>{' '}
            <code className="font-mono">{i.entries.join(', ')}</code>: {i.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
