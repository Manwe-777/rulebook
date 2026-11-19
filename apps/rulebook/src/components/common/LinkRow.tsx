import { Link } from 'react-router';

/** One row of a faction's index lists: a link with an optional small note after the name. */
export default function LinkRow({ to, name, note }: { to: string; name: string; note?: string }) {
  return (
    <li className="dotted-rule">
      <Link to={to} className="block px-3 py-1.5 font-semibold hover:bg-parchment-dark">
        {name}
        {note && <span className="ml-1.5 text-sm font-medium text-ink-muted uppercase">{note}</span>}
      </Link>
    </li>
  );
}
