import type React from 'react';
import { type ReactNode, useId } from 'react';
import { cx, useControllable } from './utils';

/* ── Radio group ── */

export interface RadioOption<V extends string> {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  /** Shown at the start of the option (cards). */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string> {
  options: RadioOption<V>[];
  value?: V | null;
  defaultValue?: V | null;
  onChange?: (v: V) => void;
  /** Group label (visible legend). */
  label?: ReactNode;
  /** Accessible name when there's no visible label. */
  'aria-label'?: string;
  orientation?: 'vertical' | 'horizontal';
  /** Each option as a bordered card. */
  variant?: 'plain' | 'cards';
  name?: string;
  disabled?: boolean;
  error?: ReactNode;
}

export function RadioGroup<V extends string>({
  options,
  value,
  defaultValue = null,
  onChange,
  label,
  'aria-label': ariaLabel,
  orientation = 'vertical',
  variant = 'plain',
  name,
  disabled,
  error,
}: RadioGroupProps<V>) {
  const [current, set] = useControllable<V | null>(value, defaultValue, onChange as (v: V | null) => void);
  const auto = useId();
  const group = name ?? auto;
  return (
    <fieldset
      className={cx('radio-group', `is-${orientation}`, variant === 'cards' && 'is-cards', error && 'is-invalid')}
      disabled={disabled}
      aria-label={label ? undefined : ariaLabel}
    >
      {label && <legend className="label">{label}</legend>}
      <div className="radio-options">
        {options.map((o) => {
          const oid = `${group}-${o.value}`;
          return (
            <label key={o.value} htmlFor={oid} className={cx('choice', o.disabled && 'is-disabled', current === o.value && 'is-on')}>
              <input
                type="radio"
                className="radio"
                id={oid}
                name={group}
                value={o.value}
                checked={current === o.value}
                disabled={o.disabled}
                aria-describedby={o.description ? `${oid}-d` : undefined}
                onChange={() => set(o.value)}
              />
              {o.icon && (
                <span className="choice-icon" aria-hidden="true">
                  {o.icon}
                </span>
              )}
              <span className="choice-text">
                <span className="choice-label">{o.label}</span>
                {o.description && (
                  <span className="choice-desc" id={`${oid}-d`}>
                    {o.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <div className="err" role="alert">
          {error}
        </div>
      )}
    </fieldset>
  );
}

/* ── RadioCards: the same group, each option a selectable card with an icon ── */

export type RadioCardsProps<V extends string> = Omit<RadioGroupProps<V>, 'variant'> & {
  /** Minimum card width before wrapping, in px. */
  minCardWidth?: number;
};

export function RadioCards<V extends string>({ minCardWidth = 200, ...props }: RadioCardsProps<V>) {
  return (
    <div className="radio-cards" style={{ '--card-min': `${minCardWidth}px` } as React.CSSProperties}>
      <RadioGroup {...props} variant="cards" />
    </div>
  );
}
