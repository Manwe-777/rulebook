import { ARMY_PARAM, MODE_PARAM, PLAY_MODE, UNIT_PARAM } from '../constants';
import { useQueryParam } from './useQueryParam';

/**
 * The open army (`?army=<id>`); `null` is the list of armies. Opening an army closes any open unit and starts in edit
 * mode, or in play mode with `play`.
 */
export function useArmyRoute(): [string | null, (id: string | null, play?: boolean) => void] {
  const [id, go] = useQueryParam(ARMY_PARAM, [UNIT_PARAM, MODE_PARAM]);

  return [id, (next, play = false) => go(next, play ? { [MODE_PARAM]: PLAY_MODE } : {})];
}
