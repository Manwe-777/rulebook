import type { PrintEntry, PrintGroup } from '../../print/printSheet';

function details(entry: PrintEntry): string {
  return [
    ...entry.wargear,
    entry.enhancement && `Enhancement: ${entry.enhancement}`,
    entry.upgrade && `Upgrade: ${entry.upgrade}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Every unit with size, loadout and points; combined units bracketed together with their total. */
export default function RosterTable({ groups }: { groups: PrintGroup[] }) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead className="bg-bar text-white">
        <tr>
          <th className="px-2 py-1">Unit</th>
          <th className="px-2 py-1">Models</th>
          <th className="px-2 py-1">Loadout</th>
          <th className="px-2 py-1 text-right">Points</th>
        </tr>
      </thead>
      {groups.map((group) => (
        <tbody key={group.entries.at(-1)!.id} className="break-inside-avoid border-b-2 border-rule">
          {group.entries.map((entry, i) => (
            <tr key={entry.id} className={group.combined ? 'bg-bar/5' : ''}>
              <td className={`px-2 py-1 font-bold ${group.combined && i > 0 ? 'pl-6' : ''}`}>
                {group.combined && i < group.entries.length - 1 ? '▸ ' : ''}
                {entry.name}
                {entry.warlord && <span className="ml-2 text-xs font-normal uppercase">(Warlord)</span>}
              </td>
              <td className="px-2 py-1">{entry.models}</td>
              <td className="px-2 py-1">{details(entry) || '—'}</td>
              <td className="px-2 py-1 text-right">{entry.points}</td>
            </tr>
          ))}
          {group.combined && (
            <tr className="bg-bar/5 text-xs text-ink-muted uppercase">
              <td className="px-2 pb-1" colSpan={3}>
                Combined unit
              </td>
              <td className="px-2 pb-1 text-right font-bold">{group.points}</td>
            </tr>
          )}
        </tbody>
      ))}
    </table>
  );
}
