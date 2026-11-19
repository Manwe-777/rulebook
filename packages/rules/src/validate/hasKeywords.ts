import type { Unit } from '../types';
import { keywordKey } from '../utils/keywordKey';

/** Whether a unit has all of the given keywords (or, with `any`, at least one), counting its faction keywords. */
export function hasKeywords(unit: Unit, keywords: string[], any = false): boolean {
  const own = new Set([...unit.keywords, ...unit.factionKeywords].map(keywordKey));
  const test = (k: string) => own.has(keywordKey(k));

  return any ? keywords.some(test) : keywords.every(test);
}
