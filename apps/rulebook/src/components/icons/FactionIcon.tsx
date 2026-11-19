/** A glyph from the wh40k-icon font, e.g. `orks`. */
export default function FactionIcon({ name, className = '' }: { name: string; className?: string }) {
  return <i aria-hidden className={`wh40k-${name} not-italic ${className}`} />;
}
