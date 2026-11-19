export default function CrosshairIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 1.5v6M12 16.5v6M1.5 12h6M16.5 12h6" />
    </svg>
  );
}
