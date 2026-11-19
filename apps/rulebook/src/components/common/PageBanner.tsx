import type { CSSProperties, ReactNode } from 'react';

import FactionIcon from '../icons/FactionIcon';

/** Camo header with a coloured band, used at the top of faction pages. */
export default function PageBanner({
  color,
  icon,
  children,
}: {
  color: string;
  icon: string | null;
  children: ReactNode;
}) {
  return (
    <header className="sheet-camo relative overflow-hidden text-white" style={{ '--faction': color } as CSSProperties}>
      <div className="sheet-band absolute inset-x-0 top-5 h-16" />
      {icon && <FactionIcon name={icon} className="absolute -top-2 right-2 text-[9rem] leading-none text-white/15" />}
      <div className="relative px-4 pt-6 pb-8 md:px-10">{children}</div>
    </header>
  );
}
