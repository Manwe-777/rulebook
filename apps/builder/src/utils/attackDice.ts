const DICE = /^(\d*)D(\d+)(?:\+(\d+))?$/i;

/** The attacks of `count` weapons with this A: `10` from 10 × 1, `10D3` from 10 × D3, `3D3+3` from 3 × D3+1. */
export function totalAttacks(attacks: string, count: number): string {
  if (/^\d+$/.test(attacks)) return String(Number(attacks) * count);

  const dice = DICE.exec(attacks);

  if (!dice) return count === 1 ? attacks : `${count} × ${attacks}`;

  const n = Number(dice[1] || 1) * count;
  const bonus = Number(dice[3] ?? 0) * count;

  return `${n === 1 ? '' : n}D${dice[2]}${bonus ? `+${bonus}` : ''}`;
}

/**
 * What to roll for a weapon the unit carries `count` of: `Roll 10 attacks, hitting on 3+`, or `10D3 attacks, hitting
 * automatically` for a weapon with no hit roll. Abilities that add attacks (Blast, Rapid Fire) are not counted.
 */
export function attackDice(attacks: string, skill: string, count: number): string {
  const total = totalAttacks(attacks, count);
  const hit = /^\d\+$/.test(skill) ? `hitting on ${skill}` : 'hitting automatically';

  return `Roll ${total} attack${total === '1' ? '' : 's'}, ${hit}`;
}
