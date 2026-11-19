import type { Detachment, Muster } from '../types';

/** Short facts about a detachment for lists and banners: its cost in detachment points, disposition and unique tags. */
export function detachmentTags(detachment: Detachment, muster: Muster | undefined): string[] {
  const disposition = detachment.disposition
    ? (muster?.dispositions.find((d) => d.id === detachment.disposition)?.name ?? detachment.disposition)
    : null;

  return [`${detachment.cost} DP`, ...(disposition ? [disposition] : []), ...detachment.unique];
}
