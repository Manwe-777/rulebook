import { detachmentTags } from '@rulebook/rules';
import { useParams } from 'react-router';

import { useLibrary } from '../../hooks/useLibrary';
import { factionTheme } from '../../utils/factionTheme';
import Breadcrumbs from '../common/Breadcrumbs';
import Markdown from '../common/Markdown';
import PageBanner from '../common/PageBanner';
import SectionPanel from '../datasheet/SectionPanel';
import EnhancementCard from '../detachment/EnhancementCard';
import StratagemCard from '../detachment/StratagemCard';
import NotFoundPage from './NotFoundPage';

export default function DetachmentPage() {
  const { faction: factionId = '', detachment: detachmentId = '' } = useParams();
  const library = useLibrary();
  const found = library.detachment(factionId, detachmentId);

  if (!found) return <NotFoundPage />;

  const { faction, detachment } = found;
  const theme = factionTheme({}, faction);
  const tags = detachmentTags(detachment, library.muster);

  return (
    <div className="flex flex-col gap-3">
      <Breadcrumbs faction={faction} />
      <article className="overflow-hidden rounded-xl font-sans text-ink shadow-2xl">
        <PageBanner color={theme.color} icon={theme.icon}>
          <h2 className="text-3xl leading-none font-extrabold tracking-wide uppercase drop-shadow sm:text-4xl">
            {detachment.name}
          </h2>
          <p className="mt-2 text-sm font-semibold tracking-wide uppercase">{tags.join(' · ')}</p>
        </PageBanner>
        <div className="sheet-paper grid gap-6 px-3 py-5 sm:px-4 md:grid-cols-[3fr_2fr] md:px-10">
          <div className="flex min-w-0 flex-col gap-4">
            {detachment.sections.description && (
              <div className="italic">
                <Markdown>{detachment.sections.description}</Markdown>
              </div>
            )}
            {detachment.sections.rule && (
              <SectionPanel title="Detachment rule">
                <Markdown>{detachment.sections.rule}</Markdown>
              </SectionPanel>
            )}
            {detachment.enhancements.length > 0 && (
              <SectionPanel title="Enhancements">
                <ul className="flex flex-col gap-3">
                  {detachment.enhancements.map((e) => (
                    <EnhancementCard key={e.id} enhancement={e} />
                  ))}
                </ul>
              </SectionPanel>
            )}
          </div>
          {detachment.stratagems.length > 0 && (
            <section className="min-w-0">
              <h3 className="mb-3 bg-bar px-3 py-1 text-lg font-bold tracking-wide text-white uppercase">Stratagems</h3>
              <ul className="flex flex-col gap-3">
                {detachment.stratagems.map((s) => (
                  <StratagemCard key={s.id} stratagem={s} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
