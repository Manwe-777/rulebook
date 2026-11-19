import { activeConstraints } from './activeConstraints';
import { constraintHolds } from './constraintHolds';
import { issue } from './issue';
import type { Check } from './types';

/** Every active constraint without `allow` holds; each one that doesn't is reported with its own message. */
export const checkConstraints: Check = (ctx) =>
  activeConstraints(ctx)
    .filter(({ constraint }) => !constraint.allow)
    .flatMap(({ constraint, source }) => {
      const { ok, selected } = constraintHolds(ctx, constraint);

      return ok
        ? []
        : [
            issue(
              constraint.id,
              constraint.message,
              selected.map((r) => r.entry.id),
              source,
            ),
          ];
    });
