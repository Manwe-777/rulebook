import { type Unit, wargearName, type WargearOption } from '@rulebook/rules';

/** Who may take an option: "This model" on a one-model unit, "The Theyn" for a model type of one, or a count. */
function who(unit: Unit, option: WargearOption): string {
  const models = unit.composition.models;
  const type = models.find((m) => m.name === option.models);

  if (models.reduce((sum, m) => sum + m.max, 0) === 1) return 'This model';
  if (type?.max === 1) return `The ${type.name}`;

  const kind = option.models ? `${option.models} ` : '';

  if (option.per === 'all') return `Any number of ${kind}models`;
  if (typeof option.per === 'number') return `Up to ${option.per} ${kind}model${option.per === 1 ? '' : 's'}`;

  const { count, every } = option.per;

  return count === 1 ? `1 ${kind}model in every ${every}` : `Up to ${count} ${kind}models in every ${every}`;
}

/** Each structured wargear option in plain words, e.g. `Up to 2 Veteran models can replace carbine with melta gun.` */
export function wargearOptionLines(unit: Unit): string[] {
  return unit.wargearOptions.map((option) => {
    const names = (ids: string[]) => ids.map((id) => wargearName(unit, id)).join(' and ');
    const choices = option.with.map(names).join(', or ');
    const verb = option.replace.length ? `replace ${names(option.replace)} with` : 'take';
    const cost = option.points ? ` (+${option.points} pts per model)` : '';

    return `${who(unit, option)} can ${verb} ${choices}${cost}.`;
  });
}
