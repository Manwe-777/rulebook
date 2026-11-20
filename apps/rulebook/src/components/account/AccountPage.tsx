import { useAccount } from '../../identity/useAccount';
import PageBanner from '../common/PageBanner';
import { BUTTON, NOTE, SHEET } from '../common/styles';
import SectionPanel from '../datasheet/SectionPanel';
import ExtensionButton from './ExtensionButton';
import ForgetButton from './ForgetButton';
import ImportKeyForm from './ImportKeyForm';
import PasswordForm from './PasswordForm';
import SignedInPanel from './SignedInPanel';

/** How this browser signs: make, protect, back up, import or switch keys. Keys never leave the browser. */
export default function AccountPage() {
  const account = useAccount();

  return (
    <article className={SHEET}>
      <PageBanner color="#3d4a26" icon={null}>
        <h2 className="text-3xl leading-none font-extrabold tracking-wide uppercase drop-shadow sm:text-4xl">
          Account
        </h2>
      </PageBanner>
      <div className="flex flex-col gap-4 px-3 py-5 sm:px-4 md:px-10">
        <p className={NOTE}>
          Reading needs no account. To suggest changes you need a key: the app can make one for you in this browser, or
          you can use a Nostr browser extension. Your secret key never leaves your browser.
        </p>
        {!account.online && <p className={NOTE}>This site is not connected to any relays, so editing is off.</p>}
        {account.locked && (
          <SectionPanel title="Unlock">
            <PasswordForm label="Password" action="Unlock" onSubmit={account.unlock} />
            <div className="mt-3">
              <ForgetButton />
            </div>
          </SectionPanel>
        )}
        {account.pubkey && <SignedInPanel pubkey={account.pubkey} />}
        {account.stored?.mode === 'extension' && !account.pubkey && (
          <SectionPanel title="Browser extension">
            <p className={NOTE}>
              {account.extensionStalled
                ? "Your browser extension didn't answer, so the rules are read without signing. Approve the request in the extension and reload, or stop using it here."
                : 'Waiting for your browser extension… approve the request in it.'}
            </p>
            <div className="mt-3">
              <ForgetButton />
            </div>
          </SectionPanel>
        )}
        {!account.stored && (
          <>
            <SectionPanel title="Start">
              <div className="flex flex-wrap gap-2">
                <button type="button" className={BUTTON} onClick={() => void account.ensureKey()}>
                  Make a key in this browser
                </button>
                <ExtensionButton />
              </div>
            </SectionPanel>
            <SectionPanel title="I already have a key">
              <ImportKeyForm />
            </SectionPanel>
          </>
        )}
      </div>
    </article>
  );
}
