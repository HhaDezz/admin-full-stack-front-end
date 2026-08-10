import { type ReactNode, useId } from 'react';
import { cx } from './utils';

/* ── Switch ── */

export interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  hideLabel?: boolean;
  description?: ReactNode;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Put the switch after the text (settings rows). */
  labelFirst?: boolean;
  id?: string;
  name?: string;
}

export function Switch({ checked, onChange, label, hideLabel, description, size = 'md', disabled, labelFirst, id, name }: SwitchProps) {
  const auto = useId();
  const sid = id ?? auto;
  return (
    <label className={cx('switch', `switch-${size}`, disabled && 'is-disabled', labelFirst && 'is-label-first')} htmlFor={sid}>
      <input
        type="checkbox"
        role="switch"
        id={sid}
        name={name}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-describedby={description ? `${sid}-d` : undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      <span className={cx('choice-text', hideLabel && 'sr-only')}>
        <span className="choice-label">{label}</span>
        {description && (
          <span className="choice-desc" id={`${sid}-d`}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
