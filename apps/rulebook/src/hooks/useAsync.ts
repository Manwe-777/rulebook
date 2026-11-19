import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async read and keeps its result. `reload` runs it again (after a write), keeping the old result on screen
 * until the new one arrives. Errors are kept as messages; a result that arrives after the inputs changed is dropped.
 * `loading` is true until the first result or error.
 */
export function useAsync<T>(
  read: (() => Promise<T>) | null,
  deps: unknown[],
): { data: T | undefined; error: string | null; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const reload = useCallback(() => setRound((r) => r + 1), []);

  useEffect(() => {
    if (!read) return;

    let stale = false;

    read()
      .then((value) => {
        if (stale) return;

        setData(value);
        setError(null);
      })
      .catch((e: unknown) => !stale && setError(e instanceof Error ? e.message : String(e)));

    return () => {
      stale = true;
    };
    // The caller lists what `read` depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, round]);

  return { data, error, loading: read !== null && data === undefined && error === null, reload };
}
