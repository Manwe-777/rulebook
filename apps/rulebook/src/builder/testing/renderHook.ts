import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

// Tells React this is a test environment, so `act` flushes updates and effects.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Renders a hook in a throwaway component, for tests: `result.current` is its latest value. */
export function renderHook<T>(hook: () => T): { result: { current: T }; unmount: () => void } {
  const result = { current: undefined as T };
  const root = createRoot(document.createElement('div'));

  function Probe() {
    result.current = hook();

    return null;
  }

  act(() => root.render(createElement(Probe)));

  return { result, unmount: () => act(() => root.unmount()) };
}
