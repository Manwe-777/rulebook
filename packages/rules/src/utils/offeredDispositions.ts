import type { Detachment } from '../types';

/** The force dispositions an army's detachments offer, each once, in detachment order. */
export function offeredDispositions(detachments: Detachment[]): string[] {
  return [...new Set(detachments.flatMap((d) => d.dispositions))];
}
