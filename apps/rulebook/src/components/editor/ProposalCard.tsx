import type { ProposalEntry, RulebookClient } from '@rulebook/sharing';
import { useState } from 'react';
import { npubEncode } from 'tool-db';

import { useAsync } from '../../hooks/useAsync';
import { BUTTON, BUTTON_QUIET, INPUT } from '../common/styles';
import DiffView from './DiffView';

interface Props {
  client: RulebookClient;
  faction: string;
  proposal: ProposalEntry;
  onDone: () => void;
}

/** One open proposal: who sent it, its note, the change against the current version, and accept or reject. */
export default function ProposalCard({ client, faction, proposal, onDone }: Props) {
  const [comment, setComment] = useState('');

  const { data } = useAsync(async () => {
    const head = await client.head(faction, proposal.kind, proposal.id);

    return {
      before: head ? ((await client.getBlob(head)) ?? '') : '',
      after: (await client.getBlob(proposal.blob)) ?? '',
      outdated: (head ?? undefined) !== proposal.base,
    };
  }, [proposal.key]);

  const review = async (accept: boolean) => {
    if (accept) await client.accept(faction, proposal, comment);
    else await client.reject(faction, proposal, comment || 'Rejected');
    onDone();
  };

  return (
    <li className="dotted-rule flex flex-col gap-2 pb-3">
      <p>
        <strong className="font-bold">
          {proposal.kind} {proposal.id}
        </strong>{' '}
        by <span className="font-mono text-xs">{npubEncode(proposal.author).slice(0, 20)}…</span>
        {proposal.note && <> — {proposal.note}</>}
      </p>
      {data?.outdated && (
        <p className="text-sm text-red-800">The record changed after this was proposed; check the diff carefully.</p>
      )}
      {data && <DiffView before={data.before} after={data.after} />}
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Review comment"
          placeholder="Comment"
          className={`${INPUT} flex-1`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="button" className={BUTTON} onClick={() => review(true)}>
          Accept
        </button>
        <button type="button" className={BUTTON_QUIET} onClick={() => review(false)}>
          Reject
        </button>
      </div>
    </li>
  );
}
