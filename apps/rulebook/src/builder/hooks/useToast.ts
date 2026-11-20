import { useEffect, useState } from 'react';

/** A short message and its optional action. `key` changes with every message, so the same text pops again. */
export interface Toast {
  key: number;
  text: string;
  action?: { label: string; run: () => void };
}

/** One message at a time that hides itself after `ms`; showing a new one replaces it and restarts the time. */
export function useToast(ms: number): [Toast | null, (text: string, action?: Toast['action']) => void, () => void] {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), ms);

    return () => clearTimeout(timer);
  }, [toast, ms]);

  const show = (text: string, action?: Toast['action']) => setToast((t) => ({ key: (t?.key ?? 0) + 1, text, action }));

  return [toast, show, () => setToast(null)];
}
