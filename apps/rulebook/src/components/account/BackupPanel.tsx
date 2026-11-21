import { useState } from 'react';

import { useAccount } from '../../identity/useAccount';
import { downloadText } from '../../utils/downloadText';
import { BUTTON_QUIET, NOTE } from '../common/styles';
import EyeIcon from '../icons/EyeIcon';
import PasswordForm from './PasswordForm';

/** Backs the secret key up: as a password-protected file, or shown as a plain nsec (the eye button shows and hides it). */
export default function BackupPanel() {
  const { exportNsec, exportNcryptsec } = useAccount();
  const [shown, setShown] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <PasswordForm
        label="Password for the backup file"
        action="Download backup"
        confirm
        onSubmit={async (password) => {
          const ncryptsec = await exportNcryptsec(password);

          if (ncryptsec) downloadText('rulebook-key.ncryptsec', `${ncryptsec}\n`);
        }}
      />
      <button
        type="button"
        aria-pressed={shown !== null}
        className={`${BUTTON_QUIET} flex items-center gap-2 self-start`}
        onClick={() => (shown ? setShown(null) : exportNsec().then(setShown))}
      >
        <EyeIcon closed={shown !== null} />
        {shown ? 'Hide my secret key' : 'Show my secret key (nsec)'}
      </button>
      {shown && <p className={`${NOTE} font-mono break-all`}>{shown}</p>}
      <p className="text-sm text-ink-muted">
        Anyone with your secret key can act as you. Keep backups in a password manager. To move to a browser extension,
        import this key there, then choose “Use a browser extension” below.
      </p>
    </div>
  );
}
