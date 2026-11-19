import type { RulebookClient } from '@rulebook/sharing';
import { useState } from 'react';

import SectionPanel from '../datasheet/SectionPanel';
import ProposalsPanel from './ProposalsPanel';
import ReleasePanel from './ReleasePanel';
import RequestsPanel from './RequestsPanel';
import RolesPanel from './RolesPanel';

interface Props {
  client: RulebookClient;
  faction: string;
  owner: boolean;
}

/** What maintainers (and the owner) see in a faction's workspace. */
export default function MaintainerPanels({ client, faction, owner }: Props) {
  // Bumped when one panel changes the roles, so the others read them again.
  const [rolesVersion, setRolesVersion] = useState(0);
  const changed = () => setRolesVersion((v) => v + 1);

  return (
    <>
      <SectionPanel title="Proposals">
        <ProposalsPanel client={client} faction={faction} />
      </SectionPanel>
      <SectionPanel title="Requests to contribute">
        <RequestsPanel client={client} faction={faction} rolesVersion={rolesVersion} onChange={changed} />
      </SectionPanel>
      <SectionPanel title="People">
        <RolesPanel client={client} faction={faction} owner={owner} rolesVersion={rolesVersion} onChange={changed} />
      </SectionPanel>
      <SectionPanel title="Releases">
        <ReleasePanel client={client} faction={faction} />
      </SectionPanel>
    </>
  );
}
