import { useSyncExternalStore } from 'react';

const subscribe = (changed: () => void) => {
  window.addEventListener('popstate', changed);

  return () => window.removeEventListener('popstate', changed);
};

/**
 * A value kept in the address as `?<param>=<value>`, so the back button, reloads and links work, also on static
 * hosting without server routes. Setting it adds a history entry and clears the `clears` params, which belong to the
 * old value (an open unit belongs to its army). `null` removes it.
 */
export function useQueryParam(param: string, clears: string[] = []): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(param),
    () => null,
  );

  const go = (next: string | null) => {
    const url = new URL(window.location.href);

    if (next) url.searchParams.set(param, next);
    else url.searchParams.delete(param);
    for (const other of clears) url.searchParams.delete(other);

    window.history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  return [value, go];
}
