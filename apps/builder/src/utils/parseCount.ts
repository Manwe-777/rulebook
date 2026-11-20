/**
 * The count typed into a number field, kept within `min` and `max`. Anything that isn't a digit is ignored; an empty
 * field gives null, so the field can be cleared while typing a new number.
 */
export function parseCount(text: string, min: number, max: number): number | null {
  const digits = text.replace(/\D/g, '');

  if (digits === '') return null;

  return Math.min(max, Math.max(min, Number(digits)));
}
