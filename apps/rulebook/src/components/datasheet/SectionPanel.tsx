import type { ReactNode } from 'react';

/** A green-titled block on the datasheet body: Abilities, Leader, Wargear options, Unit composition. */
export default function SectionPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="dotted-rule pb-2">
      <h3 className="bg-bar px-3 py-1 text-lg font-bold tracking-wide text-white uppercase">{title}</h3>
      <div className="px-3 pt-2 text-[0.95rem] leading-snug">{children}</div>
    </section>
  );
}
