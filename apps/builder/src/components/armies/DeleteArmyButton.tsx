import { useState } from 'react';

import { BUTTON_QUIET } from '../styles';

/** Delete in two clicks: the first asks, the second deletes. */
export default function DeleteArmyButton({ name, onDelete }: { name: string; onDelete: () => void }) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" className={BUTTON_QUIET} aria-label={`Delete ${name}`} onClick={() => setAsking(true)}>
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 text-sm">
      Delete for good?
      <button type="button" className="rounded bg-illegal px-3 py-1 font-bold text-white uppercase" onClick={onDelete}>
        Delete
      </button>
      <button type="button" className={BUTTON_QUIET} onClick={() => setAsking(false)}>
        Keep
      </button>
    </span>
  );
}
