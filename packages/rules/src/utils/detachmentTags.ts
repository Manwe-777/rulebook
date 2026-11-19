import type { Detachment, Muster } from '../types';

/** Short facts about a detachment for lists and banners: its cost in detachment points, dispositions and unique tags. */
export function detachmentTags(detachment: Detachment, muster: Muster | undefined): string[] {
  const name = (id: string) => muster?.dispositions.find((d) => d.id === id)?.name ?? id;

  return [`${detachment.cost} DP`, ...detachment.dispositions.map(name), ...detachment.unique];
}
