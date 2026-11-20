import { type FormEvent, useState } from 'react';

import { acceptLink } from '../../sync/acceptLink';
import { BUTTON, BUTTON_QUIET, INPUT } from '../styles';
import Modal from './Modal';

interface Props {
  /** The protected key the link carries. */
  ncryptsec: string;
  /** Whether this device already has a key of its own, which linking replaces. */
  hasOwnKey: boolean;
  onLinked: (secret: string) => void;
  onClose: () => void;
}

/** Shown when this device opens a link from another one: asks for the code shown there, then syncs with its key. */
export default function AcceptLinkDialog({ ncryptsec, hasOwnKey, onLinked, onClose }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const result = await acceptLink(ncryptsec, code);

    setBusy(false);
    if ('error' in result) setError(result.error);
    else onLinked(result.secret);
  };

  return (
    <Modal title="Link this device" onClose={onClose}>
      <form className="flex flex-col gap-3" onSubmit={(e) => void submit(e)}>
        <p className="text-sm">Type the code shown on your other device.</p>
        <input
          aria-label="Code from your other device"
          className={`${INPUT} text-center font-mono text-2xl tracking-widest uppercase`}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={9}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <p className="text-xs text-text/70">
          The lists on both devices are merged, and from now on they stay in sync.
          {hasOwnKey && ' This device had its own key; it is replaced by the one from your other device.'}
        </p>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON} disabled={busy}>
            {busy ? 'Linking…' : 'Link'}
          </button>
          <button type="button" className={BUTTON_QUIET} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
