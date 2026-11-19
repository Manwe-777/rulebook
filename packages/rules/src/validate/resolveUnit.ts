import type { Library } from '../library/Library';
import type { Unit } from '../types';

/** The unit a list entry names: an id in the list's faction, or `faction/id` for another faction's unit. */
export function resolveUnit(library: Library, factionId: string, ref: string): Unit | undefined {
  const [faction, id] = ref.includes('/') ? ref.split('/') : [factionId, ref];

  return library.unit(faction, id)?.unit;
}
