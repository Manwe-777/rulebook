import type { ReactNode } from 'react';

interface Props {
  points: number;
  /** Cards of the attached leaders and support units. */
  attached: ReactNode;
  /** Card of the unit they join. */
  unit: ReactNode;
}

/** A unit with its leader and support units, framed together: attached cards on top, then the unit they join. */
export default function CombinedUnit({ points, attached, unit }: Props) {
  return (
    <li className="rounded-xl border-2 border-bar bg-black/25 p-2">
      <div className="flex items-baseline justify-between px-1 pb-2 text-sm font-bold tracking-wide text-text/80 uppercase">
        <span>Combined unit</span>
        <span>{points} pts</span>
      </div>
      <ul className="flex flex-col gap-2">{attached}</ul>
      <div aria-hidden className="ml-6 flex items-center gap-2 py-1 text-xs font-semibold text-text/60 uppercase">
        <span className="h-5 border-l-2 border-bar" />
        joins
      </div>
      <ul>{unit}</ul>
    </li>
  );
}
