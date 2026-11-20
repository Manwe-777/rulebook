/** A link code as typed (any case, spaces or a dash) in the form it was made: `k7q-mrb` → `K7QMRB`. */
export function normalizeLinkCode(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
