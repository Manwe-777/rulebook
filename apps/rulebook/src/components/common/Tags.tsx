import { Fragment } from 'react';

/** Weapon or rule keywords in square brackets, e.g. `[CLOSE-QUARTERS, HAZARDOUS]`. Wraps only between keywords. */
export default function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <span className="font-mono text-[0.8em] uppercase">
      [
      {tags.map((tag, i) => (
        <Fragment key={tag}>
          {i > 0 && ', '}
          <span className="whitespace-nowrap">{tag}</span>
        </Fragment>
      ))}
      ]
    </span>
  );
}
