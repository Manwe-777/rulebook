function Hammer({ angle }: { angle: number }) {
  return (
    <g transform={`rotate(${angle} 12 12)`}>
      <rect x="11" y="6" width="2.2" height="17" rx="0.6" />
      <path d="M6 2.5h12v5H6z" />
    </g>
  );
}

export default function CrossedHammersIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <Hammer angle={-40} />
      <Hammer angle={40} />
    </svg>
  );
}
