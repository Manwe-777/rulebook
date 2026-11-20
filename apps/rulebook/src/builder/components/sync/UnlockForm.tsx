import { type FormEvent, useState } from 'react';

import { BUTTON, INPUT } from '../styles';

/** Asks for the password of a protected key, to sync this visit. */
export default function UnlockForm({ onUnlock }: { onUnlock: (password: string) => Promise<string | null> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(await onUnlock(password));
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => void submit(e)}>
      <p className="text-sm">Your key has a password. Type it to sync this visit.</p>
      <div className="flex gap-2">
        <input
          type="password"
          aria-label="Key password"
          className={`${INPUT} min-w-0 flex-1`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className={BUTTON}>
          Unlock
        </button>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </form>
  );
}
