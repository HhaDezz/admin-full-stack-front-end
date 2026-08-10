import { type InputHTMLAttributes, type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cx } from './utils';
import { useControlProps } from './_form';

/** Sets an input's value the way typing would, so React's onChange fires. */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/* ── Input ── */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: 'sm' | 'md' | 'lg';
  /** Icon or text inside the start of the field. */
  prefix?: ReactNode;
  /** Icon, text or a small button inside the end of the field. */
  suffix?: ReactNode;
  /** Shows × when there is text. Clearing fires onChange with "". */
  clearable?: boolean;
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  size = 'md',
  prefix,
  suffix,
  clearable,
  invalid,
  className,
  ref,
  onChange,
  value,
  defaultValue,
  ...rest
}: InputProps) {
  const inner = useRef<HTMLInputElement | null>(null);
  const c = useControlProps({ ...rest, invalid });
  const [hasText, setHasText] = useState(() => String(value ?? defaultValue ?? '').length > 0);
  useEffect(() => {
    if (value !== undefined) setHasText(String(value).length > 0);
  }, [value]);
  const showClear = clearable && hasText && !c.disabled && !rest.readOnly;
  return (
    <div className={cx('control', `control-${size}`, c.invalid && 'is-invalid', c.disabled && 'is-disabled', className)}>
      {prefix && <span className="control-affix is-start">{prefix}</span>}
      <input
        {...rest}
        ref={(el) => {
          inner.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        value={value}
        defaultValue={defaultValue}
        id={c.id}
        disabled={c.disabled}
        required={c.required}
        aria-invalid={c['aria-invalid']}
        aria-describedby={c['aria-describedby']}
        className="control-input"
        onChange={(e) => {
          setHasText(e.target.value.length > 0);
          onChange?.(e);
        }}
      />
      {showClear && (
        <button
          type="button"
          className="control-clear"
          aria-label="Clear"
          onClick={() => {
            if (inner.current) {
              setNativeValue(inner.current, '');
              inner.current.focus();
            }
          }}
        >
          <X size={14} />
        </button>
      )}
      {suffix && <span className="control-affix is-end">{suffix}</span>}
    </div>
  );
}
