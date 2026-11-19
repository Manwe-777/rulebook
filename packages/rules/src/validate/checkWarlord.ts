import { issue } from './issue';
import type { Check } from './types';

/** The army has a warlord when the muster rules need one, and it has one of the warlord roles. */
export const checkWarlord: Check = (ctx) => {
  const { required, roles } = ctx.muster.warlord;
  const id = ctx.list.warlord;

  if (!id) return required ? [issue('no-warlord', 'Pick a warlord.')] : [];

  const warlord = ctx.byId.get(id);

  if (!warlord) return [issue('unknown-warlord', `The warlord "${id}" is not in the list.`, [id])];

  if (!roles.some((r) => warlord.unit.roles.includes(r))) {
    return [
      issue('warlord-role', `${warlord.unit.name} can't be the warlord: it needs to be a ${roles.join(' or ')}.`, [id]),
    ];
  }

  return [];
};
