import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cx, useControllable } from './utils';
import { useControlProps } from './_form';

/* ── Number input ── */

export interface NumberInputProps {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (v: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Decimal places to show and round to. */
  precision?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Show − / + buttons (default true). */
  stepper?: boolean;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export function NumberInput({
  value,
  defaultValue = null,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  precision,
  prefix,
  suffix,
  stepper = true,
  size = 'md',
  placeholder,
  disabled,
  invalid,
  id,
  name,
  'aria-label': ariaLabel,
}: NumberInputProps) {
  const [num, setNum] = useControllable<number | null>(value, defaultValue, onChange);
  const c = useControlProps({ id, disabled, invalid });
  const fmt = (n: number | null) => (n == null ? '' : precision != null ? n.toFixed(precision) : String(n));
  const [text, setText] = useState(fmt(num));
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current) setText(fmt(num));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num, precision]);
  const clamp = (n: number) => {
    const r = precision != null ? Number(n.toFixed(precision)) : Number(n.toPrecision(12));
    return Math.min(max, Math.max(min, r));
  };
  const commit = (n: number | null) => {
    const v = n == null ? null : clamp(n);
    setNum(v);
    setText(fmt(v));
  };
  const bump = (dir: 1 | -1, mult = 1) => commit((num ?? (Number.isFinite(min) ? min : 0) - dir * step) + dir * step * mult);
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const map: Record<string, [1 | -1, number]> = { ArrowUp: [1, 1], ArrowDown: [-1, 1], PageUp: [1, 10], PageDown: [-1, 10] };
    if (map[e.key]) {
      e.preventDefault();
      bump(map[e.key][0], e.shiftKey ? 10 : map[e.key][1]);
    } else if (e.key === 'Home' && Number.isFinite(min)) {
      e.preventDefault();
      commit(min);
    } else if (e.key === 'End' && Number.isFinite(max)) {
      e.preventDefault();
      commit(max);
    } else if (e.key === 'Enter') commit(text.trim() === '' ? null : Number(text.replace(/[^\d.-]/g, '')));
  };
  return (
    <div className={cx('control', 'number-input', `control-${size}`, c.invalid && 'is-invalid', c.disabled && 'is-disabled')}>
      {stepper && (
        <button
          type="button"
          className="num-btn"
          tabIndex={-1}
          aria-label="Decrease"
          disabled={c.disabled || (num != null && num <= min)}
          onClick={() => bump(-1)}
        >
          <Minus size={14} />
        </button>
      )}
      {prefix && <span className="control-affix is-start">{prefix}</span>}
      <input
        id={c.id}
        name={name}
        className="control-input"
        type="text"
        inputMode={precision ? 'decimal' : 'numeric'}
        role="spinbutton"
        aria-label={ariaLabel}
        aria-valuenow={num ?? undefined}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-invalid={c['aria-invalid']}
        aria-describedby={c['aria-describedby']}
        disabled={c.disabled}
        placeholder={placeholder}
        value={text}
        onFocus={() => (editing.current = true)}
        onChange={(e) => {
          const t = e.target.value;
          if (/^-?\d*([.,]\d*)?$/.test(t)) {
            setText(t);
            const n = Number(t.replace(',', '.'));
            if (t !== '' && t !== '-' && Number.isFinite(n) && n >= min && n <= max) setNum(n);
          }
        }}
        onBlur={() => {
          editing.current = false;
          commit(text.trim() === '' || text === '-' ? null : Number(text.replace(',', '.')));
        }}
        onKeyDown={onKey}
      />
      {suffix && <span className="control-affix is-end">{suffix}</span>}
      {stepper && (
        <button
          type="button"
          className="num-btn"
          tabIndex={-1}
          aria-label="Increase"
          disabled={c.disabled || (num != null && num >= max)}
          onClick={() => bump(1)}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}
