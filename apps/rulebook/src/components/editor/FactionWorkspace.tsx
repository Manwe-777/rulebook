import { useParams } from 'react-router';

import { useLibrary } from '../../hooks/useLibrary';
import { useRole } from '../../hooks/useRole';
import { useAccount } from '../../identity/useAccount';
import { factionTheme } from '../../utils/factionTheme';
import Breadcrumbs from '../common/Breadcrumbs';
import PageBanner from '../common/PageBanner';
import { SHEET } from '../common/styles';
import SectionPanel from '../datasheet/SectionPanel';
import NotFoundPage from '../pages/NotFoundPage';
import MaintainerPanels from './MaintainerPanels';
import RecordsPanel from './RecordsPanel';
import RequestAccess from './RequestAccess';
import WorkspaceNotices from './WorkspaceNotices';

const ROLE_TEXT = {
  owner: 'You are the owner.',
  maintainer: 'You maintain this faction.',
  contributor: 'You are a contributor: your changes go to the maintainers for review.',
  reader: 'You are not a contributor yet.',
};

/** Where contributors pick what to edit and maintainers review, manage people and release. */
export default function FactionWorkspace() {
  const { faction: id = '' } = useParams();
  const faction = useLibrary().faction(id);
  const { client, online, locked } = useAccount();
  const { role } = useRole(id);

  if (!faction) return <NotFoundPage />;

  const maintains = role === 'maintainer' || role === 'owner';

  return (
    <div className="flex flex-col gap-3">
      <Breadcrumbs faction={faction} />
      <article className={SHEET}>
        <PageBanner color={factionTheme({}, faction).color} icon={null}>
          <h2 className="text-3xl leading-none font-extrabold tracking-wide uppercase drop-shadow sm:text-4xl">
            Edit {faction.name}
          </h2>
          <p className="mt-2 text-sm font-semibold">{ROLE_TEXT[role]}</p>
        </PageBanner>
        <div className="flex flex-col gap-4 px-3 py-5 sm:px-4 md:px-10">
          <WorkspaceNotices online={online} locked={locked} />
          {online && role === 'reader' && (
            <SectionPanel title="Contribute">
              <RequestAccess faction={id} />
            </SectionPanel>
          )}
          {role !== 'reader' && (
            <SectionPanel title="Records">
              <RecordsPanel faction={faction} />
            </SectionPanel>
          )}
          {client && maintains && <MaintainerPanels client={client} faction={id} owner={role === 'owner'} />}
        </div>
      </article>
    </div>
  );
}
