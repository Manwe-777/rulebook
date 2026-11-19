import { decodeListLink } from '@rulebook/rules';
import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router';

import { useLibrary } from '../../hooks/useLibrary';
import { usePrintOptions } from '../../hooks/usePrintOptions';
import { SourceContext } from '../../library/SourceContext';
import { printSheet } from '../../print/printSheet';
import ArmySheet from './ArmySheet';
import PrintControls from './PrintControls';

/**
 * A printable sheet for an army from the list builder, which passes the list after `#army=` (never sent to a server):
 * roster, army rules, detachment rules and stratagems, and datasheets, each optional.
 */
export default function PrintPage() {
  const library = useLibrary();
  const source = useContext(SourceContext);
  const [options, setOption] = usePrintOptions();
  const { hash } = useLocation();
  const list = useMemo(() => decodeListLink(new URLSearchParams(hash.slice(1)).get('army') ?? ''), [hash]);

  if (!list) return <p>This link has no army in it. Open the print page from the list builder.</p>;

  const sheet = printSheet(list, library);

  if (!sheet.faction && ['loading', 'cached'].includes(source)) return <p>Loading rules from the relays…</p>;

  return (
    <div className="flex flex-col gap-4 print:gap-6">
      <PrintControls options={options} onChange={setOption} />
      <ArmySheet sheet={sheet} options={options} />
    </div>
  );
}
