import { useState } from 'react';

import type { EditableKind } from '../../editor/types';
import type { Role } from '../../hooks/useRole';
import { useSubmitRecord } from '../../hooks/useSubmitRecord';
import { INPUT, NOTE } from '../common/styles';
import SendButton from './SendButton';

interface Props {
  role: Role;
  faction: string;
  kind: EditableKind;
  id: string;
  text: string;
  blocked: boolean;
}

/** Saves the record (maintainers) or proposes it with a note (contributors). */
export default function SubmitBar({ role, faction, kind, id, text, blocked }: Props) {
  const maintains = role === 'maintainer' || role === 'owner';
  const { state, submit, ready } = useSubmitRecord(faction, kind, id, maintains);
  const [note, setNote] = useState('');

  if (role === 'reader' || !ready) return <p className={NOTE}>Only contributors can send changes.</p>;
  if (state === 'done') return <p className={NOTE}>{maintains ? 'Saved.' : 'Sent to the maintainers for review.'}</p>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!maintains && (
        <input
          aria-label="Note"
          placeholder="What did you change and why?"
          className={`${INPUT} flex-1`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      )}
      <SendButton
        label={maintains ? 'Save' : 'Propose change'}
        blocked={blocked}
        busy={state === 'busy'}
        failed={state === 'failed'}
        onSend={() => submit(text, note)}
      />
    </div>
  );
}
