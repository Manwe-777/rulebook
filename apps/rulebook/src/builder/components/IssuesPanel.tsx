import type { Issue } from '@rulebook/rules';

import { PANEL, PANEL_TITLE } from './styles';

/** Every problem in the list; problems with one unit are shown on its card too. */
export default function IssuesPanel({ issues }: { issues: Issue[] }) {
  if (!issues.length) return null;

  return (
    <section className={PANEL}>
      <h2 className={`${PANEL_TITLE} bg-illegal`}>Problems</h2>
      <ul className="flex flex-col gap-1 p-3">
        {issues.map((i) => (
          <li
            key={`${i.code}-${i.entries.join()}-${i.message}`}
            className={i.severity === 'error' ? '' : 'text-text/70'}
          >
            {i.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
