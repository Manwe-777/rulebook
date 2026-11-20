import { CORE_STRATAGEMS_PARAM } from '../constants';
import { useQueryParam } from './useQueryParam';

/** Whether the play view's stratagems include the core ones (`?core=1`, hidden by default), and a switch for it. */
export function useShowCoreStratagems(): [boolean, (show: boolean) => void] {
  const [value, go] = useQueryParam(CORE_STRATAGEMS_PARAM);

  return [value === '1', (show) => go(show ? '1' : null)];
}
