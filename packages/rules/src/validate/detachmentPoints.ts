import type { Library } from '../library/Library';
import type { ArmyList } from '../types';

/** Detachment points the list's detachments cost, and how many its battle size allows (null when unknown). */
export function detachmentPoints(list: ArmyList, library: Library): { spent: number; budget: number | null } {
  const detachments = library.faction(list.faction)?.detachments ?? [];
  const spent = list.detachments.reduce((sum, id) => sum + (detachments.find((d) => d.id === id)?.cost ?? 0), 0);
  const muster = library.muster;
  const size = muster?.battleSizes.find((b) => b.id === list.battleSize);

  return { spent, budget: muster && size ? (size.overrides.detachmentPoints ?? muster.detachmentPoints) : null };
}
