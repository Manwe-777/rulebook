import { useState } from 'react';

import { useAccount } from '../../identity/useAccount';
import { BUTTON, INPUT, LABEL, NOTE } from '../common/styles';

/** Asks the faction's maintainers to become a contributor, making a browser key first if needed. */
export default function RequestAccess({ faction }: { faction: string }) {
  const { ensureKey } = useAccount();
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const send = async () => {
    setState('sending');

    try {
      const client = await ensureKey();

      if (!client) throw new Error('offline');
      await client.requestAccess(faction, message);
      setState('sent');
    } catch {
      setState('failed');
    }
  };

  if (state === 'sent') return <p className={NOTE}>Request sent. A maintainer will add you; come back later.</p>;

  return (
    <div className="flex flex-col gap-2">
      <p>Only contributors can suggest changes. Tell the maintainers who you are and what you'd like to work on.</p>
      <label className={LABEL}>
        Message
        <textarea className={`${INPUT} min-h-20`} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <button type="button" className={`${BUTTON} self-start`} disabled={state === 'sending'} onClick={send}>
        Ask to contribute
      </button>
      {state === 'failed' && <p className="text-sm text-red-800">Could not send the request. Try again.</p>}
    </div>
  );
}
