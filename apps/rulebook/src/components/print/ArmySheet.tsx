import type { PrintOptions } from '../../print/printOptions';
import type { PrintSheet } from '../../print/printSheet';
import Markdown from '../common/Markdown';
import { SHEET } from '../common/styles';
import Datasheet from '../datasheet/Datasheet';
import ArmySummary from './ArmySummary';
import DetachmentSection from './DetachmentSection';
import RosterTable from './RosterTable';

const PAGE = `${SHEET} flex flex-col gap-4 p-4 sm:p-6 print:rounded-none print:p-0`;

/** The army sheet's sections, each starting a new printed page, as the options ask. */
export default function ArmySheet({ sheet, options }: { sheet: PrintSheet; options: PrintOptions }) {
  const { faction } = sheet;

  return (
    <>
      <section className={PAGE}>
        <ArmySummary sheet={sheet} />
        {options.roster && <RosterTable groups={sheet.groups} />}
      </section>
      {options.armyRules && faction?.body && (
        <section className={`${PAGE} print:break-before-page`}>
          <h3 className="text-2xl font-extrabold uppercase">{faction.name}: army rules</h3>
          <Markdown>{faction.body}</Markdown>
        </section>
      )}
      {(options.detachmentRules || options.stratagems) &&
        sheet.detachments.map((d) => (
          <section key={d.id} className={`${PAGE} print:break-before-page`}>
            <DetachmentSection
              detachment={d}
              taken={sheet.items.filter((t) => d.enhancements.includes(t.item))}
              rules={options.detachmentRules}
              stratagems={options.stratagems}
            />
          </section>
        ))}
      {options.datasheets &&
        faction &&
        sheet.datasheets.map((unit) => (
          <div key={unit.id} className="break-inside-avoid print:break-before-page">
            <Datasheet unit={unit} faction={faction} />
          </div>
        ))}
    </>
  );
}
