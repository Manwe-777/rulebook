import { UNIT_PARAM } from '../constants';
import { useQueryParam } from './useQueryParam';

/** The unit open in the play view (`?unit=<entry id>`), or null for the army builder. */
export function useUnitRoute(): [string | null, (id: string | null) => void] {
  return useQueryParam(UNIT_PARAM);
}
