import type { PrintSheet } from '../../print/printSheet';

/** Top of the army sheet: name, faction, size, points, detachments, warlord, and any problems. */
export default function ArmySummary({ sheet }: { sheet: PrintSheet }) {
  const warlord = sheet.groups.flatMap((g) => g.entries).find((e) => e.warlord);

  const facts = [
    ['Faction', sheet.faction?.name ?? sheet.list.faction],
    ['Battle size', sheet.battleSize],
    ['Points', `${sheet.points}${sheet.limit !== null ? ` / ${sheet.limit}` : ''}`],
    ['Detachments', sheet.detachments.map((d) => d.name).join(', ') || '—'],
    ['Warlord', warlord?.name ?? '—'],
  ];

  return (
    <header className="flex flex-col gap-2">
      <h2 className="text-3xl font-extrabold uppercase">{sheet.list.name}</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm sm:grid-cols-[auto_1fr_auto_1fr]">
        {facts.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-bold tracking-wide text-ink-muted uppercase">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {sheet.errors.length > 0 && (
        <p className="rounded border-l-4 border-red-700 bg-red-100 px-3 py-1 text-sm text-red-900">
          This list is not legal: {sheet.errors.map((e) => e.message).join(' ')}
        </p>
      )}
    </header>
  );
}
