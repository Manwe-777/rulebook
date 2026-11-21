import type { Unit } from '@rulebook/rules';

import { OTHER_UNITS_TITLE, UNIT_SECTIONS } from '../constants';

export interface UnitSection {
  title: string;
  /** The role that put the units here; undefined for the other datasheets. */
  role?: string;
  units: Unit[];
}

/**
 * The datasheets under the Add units headings: each unit once, under the first heading whose role it has, keeping the
 * given order inside a heading. Empty headings are left out.
 */
export function unitSections(units: Unit[]): UnitSection[] {
  const sections: UnitSection[] = [
    ...UNIT_SECTIONS.map(({ role, title }) => ({ title, role, units: [] as Unit[] })),
    { title: OTHER_UNITS_TITLE, units: [] },
  ];

  for (const unit of units) {
    const section = sections.find((s) => !s.role || (unit.roles as string[]).includes(s.role));

    section?.units.push(unit);
  }

  return sections.filter((s) => s.units.length > 0);
}
