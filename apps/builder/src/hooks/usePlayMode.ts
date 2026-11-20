import { MODE_PARAM, PLAY_MODE } from '../constants';
import { useQueryParam } from './useQueryParam';

/** Whether the open army is in play mode (`?mode=play`), and a switch between play and edit mode. */
export function usePlayMode(): [boolean, (play: boolean) => void] {
  const [mode, go] = useQueryParam(MODE_PARAM);

  return [mode === PLAY_MODE, (play) => go(play ? PLAY_MODE : null)];
}
