import type { ArmyList, Detachment } from '../types';
import { offeredDispositions } from './offeredDispositions';

/** The army's force disposition: the one it picked, or the only one its detachments offer. */
export function armyDisposition(list: ArmyList, detachments: Detachment[]): string | undefined {
  const offered = offeredDispositions(detachments);

  return list.disposition ?? (offered.length === 1 ? offered[0] : undefined);
}
