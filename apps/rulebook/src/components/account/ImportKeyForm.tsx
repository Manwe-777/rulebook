import { type FormEvent, useState } from 'react';

import { useAccount } from '../../identity/useAccount';
import { BUTTON, BUTTON_QUIET, INPUT, LABEL } from '../common/styles';

/**
 * Paste an existing nsec, hex or ncryptsec key, or open a backup file (which holds an ncryptsec), then give its password
 * if it has one, to sign with it in this browser.
 */
export default function ImportKeyForm() {
  const { importKey } = useAccount();
  const [key, setKey] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(await importKey(key, password));
  };

  return (
    <form className="flex flex-wrap items-end gap-2" onSubmit={submit}>
      <label className={`${BUTTON_QUIET} w-full cursor-pointer text-center sm:w-auto`}>
        Open my backup file
        <input
          type="file"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];

            e.target.value = '';
            if (file) setKey((await file.text()).trim());
          }}
        />
      </label>
      <label className={`${LABEL} min-w-64 flex-1`}>
        Or paste a secret key (nsec, ncryptsec or hex)
        <input
          type="password"
          autoComplete="off"
          className={INPUT}
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </label>
      {key.trim().startsWith('ncryptsec1') && (
        <label className={LABEL}>
          Backup password
          <input type="password" className={INPUT} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      )}
      <button type="submit" className={BUTTON} disabled={!key}>
        Use this key
      </button>
      {error && <p className="w-full text-sm text-red-800">{error}</p>}
    </form>
  );
}
