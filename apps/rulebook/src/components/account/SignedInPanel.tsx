import { npubEncode } from 'tool-db';

import { useAccount } from '../../identity/useAccount';
import SectionPanel from '../datasheet/SectionPanel';
import BackupPanel from './BackupPanel';
import ExtensionButton from './ExtensionButton';
import ForgetButton from './ForgetButton';
import PasswordForm from './PasswordForm';

const MODE = {
  browser: 'a key stored in this browser',
  protected: 'a password-protected key stored in this browser',
  extension: 'your browser extension',
};

/** What a signed-in user can do with their identity. */
export default function SignedInPanel({ pubkey }: { pubkey: string }) {
  const { stored, protect } = useAccount();
  const mode = stored?.mode ?? 'browser';

  return (
    <>
      <SectionPanel title="Your identity">
        <p className="mb-1">You sign with {MODE[mode]}.</p>
        <p className="font-mono text-sm break-all">{npubEncode(pubkey)}</p>
        <p className="mt-1 text-sm text-ink-muted">Give this public key to a maintainer if they ask for it.</p>
      </SectionPanel>
      {mode !== 'extension' && (
        <SectionPanel title="Back up">
          <BackupPanel />
        </SectionPanel>
      )}
      {mode === 'browser' && (
        <SectionPanel title="Protect with a password">
          <p className="mb-2 text-sm">You'll be asked for it once per visit before you can edit.</p>
          <PasswordForm label="New password" action="Protect" confirm onSubmit={protect} />
        </SectionPanel>
      )}
      <SectionPanel title="Other ways to sign">
        <div className="flex flex-wrap gap-2">
          {mode !== 'extension' && <ExtensionButton />}
          <ForgetButton />
        </div>
      </SectionPanel>
    </>
  );
}
