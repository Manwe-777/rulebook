import { type FormEvent, useState } from 'react';

import { BUTTON, INPUT, LABEL } from '../common/styles';

interface Props {
  label: string;
  action: string;
  /** Ask twice and require 12 characters, for setting a new password. */
  confirm?: boolean;
  /** Returns an error message, or null when done. */
  onSubmit: (password: string) => Promise<string | null | void>;
}

/** A password field (asked twice when setting one) with a submit button and its error. */
export default function PasswordForm({ label, action, confirm = false, onSubmit }: Props) {
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (confirm && password.length < 12) return setError('Use at least 12 characters.');
    if (confirm && password !== again) return setError('The passwords do not match.');

    setBusy(true);
    setError((await onSubmit(password)) ?? null);
    setBusy(false);
  };

  return (
    <form className="flex flex-wrap items-end gap-2" onSubmit={submit}>
      <label className={LABEL}>
        {label}
        <input type="password" className={INPUT} value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {confirm && (
        <label className={LABEL}>
          Again
          <input type="password" className={INPUT} value={again} onChange={(e) => setAgain(e.target.value)} />
        </label>
      )}
      <button type="submit" className={BUTTON} disabled={busy || !password}>
        {busy ? 'Working…' : action}
      </button>
      {error && <p className="w-full text-sm text-red-800">{error}</p>}
    </form>
  );
}
