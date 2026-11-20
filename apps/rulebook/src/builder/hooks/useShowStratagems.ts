import { STRATAGEMS_PARAM } from '../constants';
import { useQueryParam } from './useQueryParam';

/** Whether the play view shows the army's stratagems (`?stratagems=1`), and a switch for it. */
export function useShowStratagems(): [boolean, (show: boolean) => void] {
  const [value, go] = useQueryParam(STRATAGEMS_PARAM);

  return [value === '1', (show) => go(show ? '1' : null)];
}
