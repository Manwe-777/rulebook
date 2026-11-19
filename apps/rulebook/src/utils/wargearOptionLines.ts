import type { Unit, WargearOption } from '@rulebook/rules';

import { weaponName } from './weaponName';

function who(option: WargearOption): string {
  const kind = option.models ? `${option.models} ` : '';

  if (option.per === 'all') return `Any number of ${kind}models`;
  if (typeof option.per === 'number') return `Up to ${option.per} ${kind}model${option.per === 1 ? '' : 's'}`;

  return `1 ${kind}model in every ${option.per.every}`;
}

/** Each structured wargear option in plain words, e.g. `Up to 2 Veteran models can replace carbine with melta gun.` */
export function wargearOptionLines(unit: Unit): string[] {
  return unit.wargearOptions.map((option) => {
    const names = (ids: string[]) => ids.map((id) => weaponName(unit, id)).join(' and ');
    const choices = option.with.map(names).join(', or ');
    const verb = option.replace.length ? `replace ${names(option.replace)} with` : 'take';
    const cost = option.points ? ` (+${option.points} pts per model)` : '';

    return `${who(option)} can ${verb} ${choices}${cost}.`;
  });
}
