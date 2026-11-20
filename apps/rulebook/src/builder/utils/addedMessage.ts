/** What the "unit added" message says: the unit, and how many the army has when it has more than one. */
export function addedMessage(name: string, copies: number): string {
  return copies > 1 ? `Added ${name} · ${copies} in the army` : `Added ${name}`;
}
