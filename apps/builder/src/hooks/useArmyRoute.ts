import { ARMY_PARAM, UNIT_PARAM } from '../constants';
import { useQueryParam } from './useQueryParam';

/** The open army (`?army=<id>`); `null` is the list of armies. Opening another army closes any open unit. */
export function useArmyRoute(): [string | null, (id: string | null) => void] {
  return useQueryParam(ARMY_PARAM, [UNIT_PARAM]);
}
