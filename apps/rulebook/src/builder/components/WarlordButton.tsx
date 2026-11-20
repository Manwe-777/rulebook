import CrownIcon from './CrownIcon';

interface Props {
  warlord: boolean;
  onChange: (warlord: boolean) => void;
}

/** A large toggle that makes this unit the army's warlord, or stops it being the warlord. */
export default function WarlordButton({ warlord, onChange }: Props) {
  return (
    <button
      type="button"
      aria-pressed={warlord}
      className={`self-start rounded px-4 py-2 font-bold tracking-wide uppercase ${
        warlord ? 'bg-warlord text-ink' : 'border border-white/25 text-text hover:bg-white/10'
      }`}
      onClick={() => onChange(!warlord)}
    >
      {warlord ? (
        <>
          <CrownIcon /> Warlord
        </>
      ) : (
        'Make Warlord'
      )}
    </button>
  );
}
