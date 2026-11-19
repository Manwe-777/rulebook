import { useSyncExternalStore } from 'react';

const PARAM = 'army';

const read = () => new URLSearchParams(window.location.search).get(PARAM);

const subscribe = (changed: () => void) => {
  window.addEventListener('popstate', changed);

  return () => window.removeEventListener('popstate', changed);
};

/**
 * The open army, kept in the address as `?army=<id>` so the back button, reloads and links work, also on static
 * hosting without server routes. `null` is the list of armies.
 */
export function useArmyRoute(): [string | null, (id: string | null) => void] {
  const id = useSyncExternalStore(subscribe, read, () => null);

  const go = (next: string | null) => {
    const url = new URL(window.location.href);

    if (next) url.searchParams.set(PARAM, next);
    else url.searchParams.delete(PARAM);

    window.history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  return [id, go];
}
