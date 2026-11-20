import { checkDataset } from '@rulebook/rules';
import { useState } from 'react';

import { useLibrary } from '../../hooks/useLibrary';
import ErrorsPanel from './ErrorsPanel';
import IssuesPanel from './IssuesPanel';

/**
 * The problems in the loaded rules, checked when asked: checking reads every faction's datasheets, which the rest of
 * the page doesn't need.
 */
export default function DataChecks() {
  const library = useLibrary();
  const [checked, setChecked] = useState(false);

  if (!checked) {
    return (
      <button
        type="button"
        className="self-start text-sm text-text/70 underline hover:text-text"
        onClick={() => setChecked(true)}
      >
        Check the rules data for problems
      </button>
    );
  }

  const issues = checkDataset(library);
  const clean = !library.errors.length && !issues.length;

  return (
    <>
      <ErrorsPanel errors={library.errors} />
      <IssuesPanel issues={issues} />
      {clean && <p className="text-sm text-text/70">No problems found in the rules data.</p>}
    </>
  );
}
