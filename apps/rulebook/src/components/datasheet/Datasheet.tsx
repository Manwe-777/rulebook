import type { Faction, Unit } from '@rulebook/rules';
import type { CSSProperties } from 'react';

import { PROFILE_GROUP_NOTE } from '../../constants';
import { factionTheme } from '../../utils/factionTheme';
import { markProfileGroups } from '../../utils/markProfileGroups';
import Markdown from '../common/Markdown';
import AbilitiesPanel from './AbilitiesPanel';
import AttachPanel from './AttachPanel';
import CompositionPanel from './CompositionPanel';
import DatasheetHeader from './DatasheetHeader';
import KeywordsFooter from './KeywordsFooter';
import SectionPanel from './SectionPanel';
import WargearPanel from './WargearPanel';
import WeaponTable from './WeaponTable';

export default function Datasheet({ unit, faction }: { unit: Unit; faction: Faction }) {
  const theme = factionTheme(unit, faction);
  const { sections } = unit;
  const grouped = markProfileGroups([...unit.ranged, ...unit.melee]).some((r) => r.inGroup);

  return (
    <article
      className="overflow-hidden rounded-xl font-sans text-ink shadow-2xl"
      style={{ '--faction': theme.color } as CSSProperties}
    >
      <DatasheetHeader unit={unit} theme={theme} />
      <div className="sheet-paper px-3 pb-5 sm:px-4 md:px-10">
        <div className="grid md:grid-cols-[3fr_2fr]">
          <div className="flex min-w-0 flex-col gap-4 py-4 md:border-r-2 md:border-bar md:pr-4">
            <WeaponTable kind="ranged" weapons={unit.ranged} />
            <WeaponTable kind="melee" weapons={unit.melee} />
            {unit.leader && (
              <AttachPanel
                title="Leader"
                faction={faction}
                bodyguards={unit.leader.bodyguards}
                notes={sections.leader}
              />
            )}
            {unit.support && (
              <AttachPanel
                title="Support"
                faction={faction}
                bodyguards={unit.support.bodyguards}
                notes={sections.support}
              />
            )}
            <WargearPanel unit={unit} />
            {grouped && (
              <p className="mt-auto flex items-center gap-2 text-sm italic">
                <span className="profile-arrow block h-3 w-4 shrink-0 bg-bar" />
                {PROFILE_GROUP_NOTE}
              </p>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-4 py-4 md:pl-4">
            <AbilitiesPanel unit={unit} />
            <CompositionPanel unit={unit} />
            {sections.transport && (
              <SectionPanel title="Transport">
                <Markdown>{sections.transport}</Markdown>
              </SectionPanel>
            )}
          </div>
        </div>
        <KeywordsFooter unit={unit} theme={theme} />
      </div>
    </article>
  );
}
