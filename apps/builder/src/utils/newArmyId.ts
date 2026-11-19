/** A short id for a new army, unique enough for one browser. */
export function newArmyId(): string {
  return `army-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
