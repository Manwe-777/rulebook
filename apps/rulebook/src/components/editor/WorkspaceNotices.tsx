import { NOTE } from '../common/styles';

/** Why editing may be unavailable: no relays, or a locked key. */
export default function WorkspaceNotices({ online, locked }: { online: boolean; locked: boolean }) {
  return (
    <>
      {!online && <p className={NOTE}>This site is not connected to any relays, so editing is off.</p>}
      {locked && <p className={NOTE}>Unlock your key on the Account page to edit.</p>}
    </>
  );
}
