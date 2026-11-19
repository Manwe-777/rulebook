import { PRINT_OPTION_LABELS, type PrintOptions } from '../../print/printOptions';
import { BUTTON } from '../common/styles';

interface Props {
  options: PrintOptions;
  onChange: (key: keyof PrintOptions, on: boolean) => void;
}

/** What to include and the Print button; not printed itself. */
export default function PrintControls({ options, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-black/30 px-4 py-3 print:hidden">
      <span className="text-sm font-bold tracking-wide uppercase">Include</span>
      {(Object.keys(PRINT_OPTION_LABELS) as (keyof PrintOptions)[]).map((key) => (
        <label key={key} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={options[key]} onChange={(e) => onChange(key, e.target.checked)} />
          {PRINT_OPTION_LABELS[key]}
        </label>
      ))}
      <button type="button" className={`${BUTTON} ml-auto`} onClick={() => window.print()}>
        Print
      </button>
    </div>
  );
}
