import type { Unit } from '@rulebook/rules';

import type { FactionTheme } from '../../types';
import Markdown from '../common/Markdown';
import FactionIcon from '../icons/FactionIcon';
import StatLine from './StatLine';

export default function DatasheetHeader({ unit, theme }: { unit: Unit; theme: FactionTheme }) {
  return (
    <header className="sheet-camo relative overflow-hidden text-white">
      <div className="sheet-band absolute inset-x-0 top-5 h-16" />
      {theme.icon && (
        <FactionIcon name={theme.icon} className="absolute -top-2 right-2 text-[10rem] leading-none text-white/15" />
      )}
      <div className="relative flex flex-col gap-4 px-4 pt-6 pb-5 wide:flex-row wide:items-start wide:px-10">
        <div className="shrink-0">
          <h2 className="mb-2 text-3xl leading-none font-extrabold tracking-wide uppercase drop-shadow sm:text-4xl">
            {unit.name}
            {unit.subtitle && (
              <span className="ml-2 inline-block text-lg font-medium whitespace-nowrap sm:text-xl">
                {unit.subtitle}
              </span>
            )}
          </h2>
          <StatLine profiles={unit.profiles} />
        </div>
        {unit.image && (
          <img src={unit.image} alt="" className="mx-auto max-h-48 object-contain drop-shadow-xl wide:-my-4" />
        )}
        {unit.sections.description && (
          <div className="text-sm leading-snug font-medium italic drop-shadow wide:ml-auto wide:max-w-sm wide:pt-10">
            <Markdown>{unit.sections.description}</Markdown>
          </div>
        )}
      </div>
    </header>
  );
}
