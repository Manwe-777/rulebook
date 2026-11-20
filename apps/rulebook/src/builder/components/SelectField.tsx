import { INPUT, LABEL } from './styles';

interface Props {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  /** Label of the empty choice; leave out when a value is required. */
  none?: string;
  onChange: (value: string | undefined) => void;
}

/** A labelled dropdown; picking the empty choice gives `undefined`. */
export default function SelectField({ label, value, options, none, onChange }: Props) {
  return (
    <label className={LABEL}>
      {label}
      <select className={INPUT} value={value} onChange={(e) => onChange(e.target.value || undefined)}>
        {none !== undefined && <option value="">{none}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
