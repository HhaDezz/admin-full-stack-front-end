import { type ReactNode, useEffect, useId, useRef } from 'react';
import { cx } from './utils';

/* ── Checkbox ── */

export interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  /** Keep the label for screen readers only (e.g. table row checkboxes). */
  hideLabel?: boolean;
  description?: ReactNode;
  /** Shows a dash: some, not all, children are checked. */
  indeterminate?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  value?: string;
  id?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  hideLabel,
  description,
  indeterminate,
  disabled,
  invalid,
  name,
  value,
  id,
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const auto = useId();
  const cid = id ?? auto;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
  }, [indeterminate, checked]);
  const input = (
    <input
      ref={ref}
      id={cid}
      type="checkbox"
      className="check"
      checked={checked}
      disabled={disabled}
      name={name}
      value={value}
      aria-invalid={invalid || undefined}
      aria-label={hideLabel && typeof label === 'string' ? label : undefined}
      aria-describedby={description ? `${cid}-d` : undefined}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
  if (hideLabel && typeof label === 'string') return input;
  return (
    <label className={cx('choice', disabled && 'is-disabled')} htmlFor={cid}>
      {input}
      <span className={cx('choice-text', hideLabel && 'sr-only')}>
        <span className="choice-label">{label}</span>
        {description && (
          <span className="choice-desc" id={`${cid}-d`}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
