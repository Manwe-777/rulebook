import { COLLAPSED_KEY } from '../constants';

/** The folded unit cards saved on this device, by army id; empty when storage is unreadable or holds something else. */
export function loadCollapsed(): Record<string, string[]> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? '{}');

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, ids]) => Array.isArray(ids) && ids.every((id) => typeof id === 'string')),
    ) as Record<string, string[]>;
  } catch {
    return {};
  }
}
