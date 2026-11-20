import { qrPath } from '../../utils/qrPath';

/** A QR code for `text`, dark on white with a quiet border so phone cameras read it. */
export default function QrCode({ text, label }: { text: string; label: string }) {
  const { size, d } = qrPath(text);

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      className="mx-auto w-full max-w-64 rounded bg-white"
      shapeRendering="crispEdges"
    >
      <path d={d} fill="#000" />
    </svg>
  );
}
