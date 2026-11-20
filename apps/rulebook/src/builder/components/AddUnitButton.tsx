import { ADDED_TICK_MS } from '../constants';
import { useToast } from '../hooks/useToast';

/** The + that adds a unit; it shows a tick for a moment after each press, so every press is seen to work. */
export default function AddUnitButton({ name, onAdd }: { name: string; onAdd: () => void }) {
  const [tick, flash] = useToast(ADDED_TICK_MS);

  return (
    <button
      type="button"
      aria-label={`Add ${name}`}
      className="min-w-8 rounded bg-bar px-2 font-bold text-white hover:bg-bar-dark"
      onClick={() => {
        onAdd();
        flash('added');
      }}
    >
      {tick ? (
        <span key={tick.key} className="inline-block animate-pop">
          ✓
        </span>
      ) : (
        '+'
      )}
    </button>
  );
}
