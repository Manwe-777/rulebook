import { useState } from 'react';

import { PRINT_OPTIONS_KEY } from '../constants';
import { DEFAULT_PRINT_OPTIONS, type PrintOptions } from '../print/printOptions';

function load(): PrintOptions {
  try {
    const saved = JSON.parse(localStorage.getItem(PRINT_OPTIONS_KEY) ?? '{}') as Partial<PrintOptions>;
    const known = Object.keys(DEFAULT_PRINT_OPTIONS) as (keyof PrintOptions)[];

    return Object.fromEntries(
      known.map((k) => [k, typeof saved[k] === 'boolean' ? saved[k] : DEFAULT_PRINT_OPTIONS[k]]),
    ) as unknown as PrintOptions;
  } catch {
    return DEFAULT_PRINT_OPTIONS;
  }
}

/** The print page's include options, remembered in this browser. */
export function usePrintOptions(): [PrintOptions, (key: keyof PrintOptions, on: boolean) => void] {
  const [options, setOptions] = useState(() => (typeof window === 'undefined' ? DEFAULT_PRINT_OPTIONS : load()));

  const set = (key: keyof PrintOptions, on: boolean) => {
    const next = { ...options, [key]: on };

    setOptions(next);

    try {
      localStorage.setItem(PRINT_OPTIONS_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked: the choice still applies to this page.
    }
  };

  return [options, set];
}
