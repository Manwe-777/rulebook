import { useState } from 'react';

import { parseCount } from '../utils/parseCount';

interface Props {
  value: number;
  min?: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
}

const STEP = 'h-10 w-10 shrink-0 rounded bg-white/10 text-xl font-bold text-text hover:bg-white/20 disabled:opacity-30';

/**
 * A count with − and + buttons on either side. The field selects its text on focus and can be emptied while typing a
 * new number; an empty field goes back to the current count when it loses focus.
 */
export default function NumberStepper({ value, min = 0, max, label, onChange }: Props) {
  const [typing, setTyping] = useState<string | null>(null);

  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`One fewer: ${label}`}
        className={STEP}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        className="h-10 w-12 rounded border border-white/15 bg-black/30 text-center text-lg font-bold text-text"
        value={typing ?? String(value)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const count = parseCount(e.target.value, min, max);

          setTyping(count === null ? '' : String(count));
          if (count !== null && count !== value) onChange(count);
        }}
        onBlur={() => setTyping(null)}
      />
      <button
        type="button"
        aria-label={`One more: ${label}`}
        className={STEP}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </span>
  );
}
