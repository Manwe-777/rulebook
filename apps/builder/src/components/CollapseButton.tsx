import ChevronIcon from './ChevronIcon';

interface Props {
  name: string;
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

/** Folds a unit card down to its title, or opens it again. */
export default function CollapseButton({ name, collapsed, onToggle, className = '' }: Props) {
  return (
    <button
      type="button"
      aria-expanded={!collapsed}
      aria-label={`${collapsed ? 'Show' : 'Hide'} ${name}`}
      title={collapsed ? 'Show the card' : 'Fold the card to its title'}
      className={`shrink-0 rounded p-1 ${className}`}
      onClick={onToggle}
    >
      <ChevronIcon open={!collapsed} />
    </button>
  );
}
