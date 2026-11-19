import { type FormEvent, useState } from 'react';

import { useAccount } from '../../identity/useAccount';
import { BUTTON, INPUT, LABEL } from '../common/styles';

/** Paste an existing nsec, hex or ncryptsec key (with its password) to sign with it in this browser. */
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
      <label className={`${LABEL} min-w-64 flex-1`}>
        Secret key (nsec, ncryptsec or hex)
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
          Its password
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
