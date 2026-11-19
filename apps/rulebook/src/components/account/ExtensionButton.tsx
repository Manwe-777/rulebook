import { useState } from 'react';

import { useAccount } from '../../identity/useAccount';
import { BUTTON_QUIET } from '../common/styles';

/** Switches to signing with a NIP-07 browser extension, or says why it can't. */
export default function ExtensionButton() {
  const { switchToExtension } = useAccount();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <button type="button" className={BUTTON_QUIET} onClick={async () => setError(await switchToExtension())}>
        Use a browser extension
      </button>
      {error && <p className="text-sm text-red-800">{error}</p>}
    </div>
  );
}
