import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useControlProps } from './_form';
import { cx } from './utils';

/* ── Select: the browser's own dropdown, styled to match. Best for short fixed lists and on phones;
 * use SearchSelect when people need to search, pick several, or see rich options. ── */

export interface SelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectItemGroup {
  label: string;
  options: SelectItem[];
}

export interface SelectProps {
  options: (SelectItem | SelectItemGroup)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** A first, empty choice (also shown while nothing is picked). */
  placeholder?: string;
  /** An icon before the value. */
  prefix?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
  onBlur?: () => void;
}

const isGroup = (o: SelectItem | SelectItemGroup): o is SelectItemGroup => 'options' in o;

export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  prefix,
  size = 'md',
  disabled,
  invalid,
  required,
  id,
  name,
  'aria-label': label,
  onBlur,
}: SelectProps) {
  const c = useControlProps({ id, disabled, invalid, required });
  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;
  const empty = current === '';
  return (
    <div
      className={cx(
        'control',
        'select',
        `control-${size}`,
        c.invalid && 'is-invalid',
        c.disabled && 'is-disabled',
        empty && placeholder && 'is-empty',
      )}
    >
      {prefix && (
        <span className="control-affix is-start" aria-hidden="true">
          {prefix}
        </span>
      )}
      <select
        id={c.id}
        name={name}
        className="control-input select-native"
        value={current}
        onChange={(e) => {
          setInner(e.target.value);
          onChange?.(e.target.value);
        }}
        onBlur={onBlur}
        disabled={c.disabled}
        required={c.required}
        aria-invalid={c['aria-invalid']}
        aria-describedby={c['aria-describedby']}
        aria-label={label}
      >
        {placeholder !== undefined && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((o) =>
          isGroup(o) ? (
            <optgroup key={o.label} label={o.label}>
              {o.options.map((x) => (
                <option key={x.value} value={x.value} disabled={x.disabled}>
                  {x.label}
                </option>
              ))}
            </optgroup>
          ) : (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ),
        )}
      </select>
      <ChevronDown size={16} className="select-chevron" aria-hidden="true" />
    </div>
  );
}
