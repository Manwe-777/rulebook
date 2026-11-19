/** What the printable army sheet includes. */
export interface PrintOptions {
  roster: boolean;
  armyRules: boolean;
  detachmentRules: boolean;
  stratagems: boolean;
  datasheets: boolean;
}

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  roster: true,
  armyRules: true,
  detachmentRules: true,
  stratagems: true,
  datasheets: true,
};

export const PRINT_OPTION_LABELS: Record<keyof PrintOptions, string> = {
  roster: 'Army roster',
  armyRules: 'Army rules',
  detachmentRules: 'Detachment rules and enhancements',
  stratagems: 'Stratagems',
  datasheets: 'Datasheets',
};
