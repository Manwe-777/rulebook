import type { FileErrors } from '@rulebook/rules';

/** Lists rules files that could not be used and why. */
export default function ErrorsPanel({ errors }: { errors: FileErrors[] }) {
  if (!errors.length) return null;

  return (
    <section className="rounded-lg border border-red-400/40 bg-red-950/60 p-4 text-sm text-red-100">
      <h2 className="mb-2 font-bold uppercase">
        {errors.length} file{errors.length > 1 ? 's' : ''} could not be read
      </h2>
      <ul className="flex flex-col gap-2">
        {errors.map((e) => (
          <li key={e.path}>
            <code className="font-mono">{e.path}</code>
            <ul className="list-[square] pl-5 text-red-200">
              {e.errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
