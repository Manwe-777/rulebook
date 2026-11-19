/** The title bar of a unit card: name, cost and a remove button. */
export default function EntryHeader({
  name,
  points,
  onRemove,
}: {
  name: string;
  points: number;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-bar px-3 py-1 text-white">
      <h3 className="flex-1 text-lg font-bold tracking-wide uppercase">{name}</h3>
      <span className="font-extrabold">{points} pts</span>
      <button
        type="button"
        aria-label={`Remove ${name}`}
        className="rounded px-2 font-bold hover:bg-bar-dark"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}
