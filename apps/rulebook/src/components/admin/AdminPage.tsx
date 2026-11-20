import RelaysPanel from './RelaysPanel';

/** The project's network and people at a glance. Readable by anyone; changes happen in each faction's workspace. */
export default function AdminPage() {
  return (
    <article className="flex flex-col gap-4 overflow-hidden rounded-xl bg-parchment p-4 font-sans text-ink shadow-2xl sm:p-6">
      <h2 className="text-3xl font-extrabold tracking-wide uppercase">Admin</h2>
      <RelaysPanel />
    </article>
  );
}
