import { useState } from 'react';

import type { EditableKind } from '../editor/types';
import { useAccount } from '../identity/useAccount';

/** Sends an edited record: saved directly by maintainers, proposed with a note by contributors. */
export function useSubmitRecord(faction: string, kind: EditableKind, id: string, maintains: boolean) {
  const { client } = useAccount();
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'failed'>('idle');

  const submit = async (text: string, note: string) => {
    if (!client) return;

    setState('busy');

    try {
      if (maintains) await client.edit(faction, kind, id, text);
      else await client.propose(faction, { kind, id, text, note });
      setState('done');
    } catch {
      setState('failed');
    }
  };

  return { state, submit, ready: client !== null };
}
