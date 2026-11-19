import { useState } from 'react';

import { useAccount } from '../../identity/useAccount';
import { BUTTON_QUIET } from '../common/styles';

/** Signs out by forgetting the stored key, after a second click that warns it can't be undone without a backup. */
export default function ForgetButton() {
  const { forget, stored } = useAccount();
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" className={BUTTON_QUIET} onClick={() => setAsking(true)}>
        Sign out
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-red-800">
        {stored?.mode === 'extension'
          ? 'Stop using the extension here?'
          : 'This forgets your key in this browser. Without a backup it is gone for good.'}
      </span>
      <button type="button" className="rounded bg-red-800 px-3 py-1 font-bold text-white uppercase" onClick={forget}>
        Sign out
      </button>
      <button type="button" className={BUTTON_QUIET} onClick={() => setAsking(false)}>
        Cancel
      </button>
    </div>
  );
}
