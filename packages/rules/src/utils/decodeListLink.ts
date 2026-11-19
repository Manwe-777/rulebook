import { listSchema } from '../schemas/listSchema';
import type { ArmyList } from '../types';

/** The army list in a link made by `encodeListLink`, or null when the text isn't one. */
export function decodeListLink(text: string): ArmyList | null {
  try {
    const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
    const json = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
    const parsed = listSchema.safeParse(JSON.parse(json));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
