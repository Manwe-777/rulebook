import { Link } from 'react-router';

import { useConnectionSummary } from '../../hooks/useConnectionSummary';
import Modal from '../common/Modal';
import RelaysPanel from './RelaysPanel';

/** The connection state in full: what this browser can do now, and every relay the site knows of. */
export default function ConnectionDialog({ onClose }: { onClose: () => void }) {
  const { label, detail } = useConnectionSummary();

  return (
    <Modal title="Connection" onClose={onClose}>
      <p>
        <span className="font-bold">{label}</span> · {detail}.{' '}
        <Link to="/account" className="underline" onClick={onClose}>
          Account
        </Link>
      </p>
      <RelaysPanel />
    </Modal>
  );
}
