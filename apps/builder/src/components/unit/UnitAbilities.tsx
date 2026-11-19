import type { Enhancement, Unit } from '@rulebook/rules';

import RulesText from './RulesText';

interface Props {
  unit: Unit;
  /** The unit's wargear abilities, already narrowed to what it carries. */
  wargearRules: string | undefined;
  items: Enhancement[];
}

const SUBHEAD = 'mt-2 font-bold uppercase first:mt-0';

/** Core and faction abilities, the unit's own, its wargear's, and its enhancement or upgrade. */
export default function UnitAbilities({ unit, wargearRules, items }: Props) {
  const named = (label: string, list: string[]) =>
    list.length > 0 && (
      <p>
        <span className="font-bold">{label}:</span> {list.join(', ')}
      </p>
    );

  return (
    <section className="flex flex-col gap-1 px-3 py-2">
      <h4 className="-mx-3 mb-1 bg-bar px-3 py-1 font-bold text-white uppercase">Abilities</h4>
      {named('Core', unit.coreAbilities)}
      {named('Faction', unit.factionAbilities)}
      {unit.sections.abilities && <RulesText>{unit.sections.abilities}</RulesText>}
      {wargearRules && (
        <>
          <p className={SUBHEAD}>Wargear</p>
          <RulesText>{wargearRules}</RulesText>
        </>
      )}
      {items.map((item) => (
        <div key={item.id}>
          <p className={SUBHEAD}>
            {item.target === 'unit' ? 'Upgrade' : 'Enhancement'}: {item.name}
          </p>
          {item.text && <RulesText>{item.text}</RulesText>}
        </div>
      ))}
    </section>
  );
}
