import type { Issue } from '@rulebook/rules';

/** Parse errors of the edited record and the dataset checks of its faction. */
export default function ProblemList({ errors, issues }: { errors: string[]; issues: Issue[] }) {
  if (!errors.length && !issues.length)
    return <p className="text-sm font-semibold text-green-900">No problems found.</p>;

  return (
    <ul className="list-[square] pl-5 text-sm">
      {errors.map((e) => (
        <li key={e} className="text-red-800">
          {e}
        </li>
      ))}
      {issues.map((i) => (
        <li key={`${i.code}-${i.message}`} className={i.severity === 'error' ? 'text-red-800' : 'text-ink-muted'}>
          {i.message}
        </li>
      ))}
    </ul>
  );
}
