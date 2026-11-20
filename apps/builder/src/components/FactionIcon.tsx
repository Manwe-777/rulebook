import { iconScale } from '@rulebook/rules';

/** A glyph from the wh40k-icon font, e.g. `orks`, named by the faction's data. */
export default function FactionIcon({ name, className = '' }: { name: string; className?: string }) {
  const scale = iconScale(name);

  // Wide glyphs (the Imperial aquila) are drawn smaller, inside a box of the usual size.
  return (
    <span aria-hidden className={`inline-flex items-center justify-center ${className}`}>
      <i className={`wh40k-${name} not-italic`} style={scale < 1 ? { fontSize: `${scale}em` } : undefined} />
    </span>
  );
}
