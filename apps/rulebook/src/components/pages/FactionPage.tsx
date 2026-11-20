import { Link, useParams } from 'react-router';

import { useLibrary } from '../../hooks/useLibrary';
import { factionTheme } from '../../utils/factionTheme';
import Markdown from '../common/Markdown';
import PageBanner from '../common/PageBanner';
import DetachmentList from './DetachmentList';
import IncludedFactions from './IncludedFactions';
import NotFoundPage from './NotFoundPage';
import UnitList from './UnitList';

export default function FactionPage() {
  const { faction: id = '' } = useParams();
  const faction = useLibrary().faction(id);

  if (!faction) return <NotFoundPage />;

  const theme = factionTheme({}, faction);

  return (
    <article className="overflow-hidden rounded-xl font-sans text-ink shadow-2xl">
      <PageBanner color={theme.color} icon={theme.icon}>
        <h2 className="text-3xl leading-none font-extrabold tracking-wide uppercase drop-shadow sm:text-4xl">
          {faction.name}
        </h2>
        <Link to={`/${faction.id}/edit`} className="mt-2 inline-block text-sm font-semibold uppercase underline">
          Edit or contribute
        </Link>
      </PageBanner>
      <div className="sheet-paper grid gap-6 px-3 py-5 sm:px-4 md:grid-cols-[3fr_2fr] md:px-10">
        <div className="min-w-0 text-[0.95rem] leading-snug">
          <Markdown>{faction.body}</Markdown>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <IncludedFactions faction={faction} />
          <DetachmentList faction={faction} />
          <UnitList faction={faction} />
        </div>
      </div>
    </article>
  );
}
