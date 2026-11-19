import { useConnectionSummary } from '../../hooks/useConnectionSummary';
import { BUTTON } from '../common/styles';
import SubmitStatus from './SubmitStatus';

interface Props {
  label: string;
  blocked: boolean;
  busy: boolean;
  failed: boolean;
  onSend: () => void;
}

/** The send button, off while the record has errors or no relay can take the change, with the reason next to it. */
export default function SendButton({ label, blocked, busy, failed, onSend }: Props) {
  const link = useConnectionSummary();

  return (
    <>
      <button type="button" className={BUTTON} disabled={blocked || !link.canWrite || busy} onClick={onSend}>
        {label}
      </button>
      <SubmitStatus blocked={blocked} offline={link.canWrite ? null : link.detail} failed={failed} />
    </>
  );
}
