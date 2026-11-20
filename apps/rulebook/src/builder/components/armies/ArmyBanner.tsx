import FactionIcon from '../../../components/icons/FactionIcon';

interface Props {
  name: string;
  faction: string;
  battleSize: string;
  icon: string | undefined;
  errors: number;
}

/** Top of an army card, in the faction's colour: its icon, the army's name, faction and size, and whether it's legal. */
export default function ArmyBanner({ name, faction, battleSize, icon, errors }: Props) {
  const legal = errors === 0;

  return (
    <span className="relative flex items-center gap-3 overflow-hidden bg-bar px-3 py-2 text-white">
      {icon && (
        <>
          <FactionIcon name={icon} className="text-4xl leading-none" />
          {/* A large faint copy behind the text, like the datasheet headers. */}
          <FactionIcon
            name={icon}
            className="pointer-events-none absolute -right-3 -bottom-6 text-8xl leading-none text-white/10"
          />
        </>
      )}
      <span className="relative flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xl font-extrabold">{name}</span>
        <span className="text-xs font-semibold tracking-wide text-white/80 uppercase">
          {faction} · {battleSize}
        </span>
      </span>
      <span
        className={`relative rounded px-2 py-0.5 text-sm font-bold uppercase shadow ${legal ? 'bg-legal' : 'bg-illegal'}`}
      >
        {legal ? 'Legal' : `${errors} problem${errors === 1 ? '' : 's'}`}
      </span>
    </span>
  );
}
