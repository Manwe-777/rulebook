import { useState } from 'react';
import { npubDecode, npubEncode } from 'tool-db';

import { BUTTON_QUIET, INPUT } from '../common/styles';

/** Reads a public key given as npub or hex, or null. */
function readPublicKey(text: string): string | null {
  const key = text.trim();

  if (/^[0-9a-f]{64}$/.test(key)) return key;

  try {
    return npubDecode(key);
  } catch {
    return null;
  }
}

interface Props {
  keys: string[];
  onSave: (keys: string[]) => Promise<void>;
}

/** A list of public keys with add (npub or hex) and remove, saved on each change. */
export default function KeyListEditor({ keys, onSave }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    const key = readPublicKey(text);

    if (!key) return setError('Paste an npub or a 64 character hex public key.');
    setError(null);
    setText('');
    await onSave([...new Set([...keys, key])]);
  };

  return (
    <div className="flex flex-col gap-2">
      <ul>
        {keys.map((k) => (
          <li key={k} className="dotted-rule flex items-center gap-2 py-1">
            <span className="flex-1 font-mono text-xs break-all">{npubEncode(k)}</span>
            <button type="button" className={BUTTON_QUIET} onClick={() => onSave(keys.filter((x) => x !== k))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Public key"
          placeholder="npub1…"
          className={`${INPUT} flex-1`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="button" className={BUTTON_QUIET} onClick={add}>
          Add
        </button>
      </div>
      {error && <p className="text-sm text-red-800">{error}</p>}
    </div>
  );
}
