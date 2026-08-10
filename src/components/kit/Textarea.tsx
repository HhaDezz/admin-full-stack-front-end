import { type ChangeEvent, type Ref, type TextareaHTMLAttributes, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cx } from './utils';
import { useControlProps } from './_form';

/* ── Textarea ── */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grows with its content between minRows and maxRows. */
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  /** Shows "12 / 280" under the field (needs maxLength for the total). */
  showCount?: boolean;
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  autosize,
  minRows = 3,
  maxRows = 10,
  showCount,
  invalid,
  className,
  ref,
  onChange,
  value,
  defaultValue,
  maxLength,
  ...rest
}: TextareaProps) {
  const inner = useRef<HTMLTextAreaElement | null>(null);
  const c = useControlProps({ ...rest, invalid });
  const [count, setCount] = useState(() => String(value ?? defaultValue ?? '').length);
  const resize = () => {
    const el = inner.current;
    if (!el || !autosize) return;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 21;
    const pad = parseFloat(getComputedStyle(el).paddingTop) + parseFloat(getComputedStyle(el).paddingBottom) + 2;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, lh * minRows + pad), lh * maxRows + pad)}px`;
    el.style.overflowY = el.scrollHeight > lh * maxRows + pad ? 'auto' : 'hidden';
  };
  // Re-measure after every render: the text, width or font may have changed.
  useLayoutEffect(() => resize());
  useEffect(() => {
    if (value !== undefined) setCount(String(value).length);
  }, [value]);
  return (
    <div className={cx('textarea-wrap', className)}>
      <textarea
        {...rest}
        ref={(el) => {
          inner.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        rows={minRows}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        id={c.id}
        disabled={c.disabled}
        required={c.required}
        aria-invalid={c['aria-invalid']}
        aria-describedby={c['aria-describedby']}
        className={cx('textarea', c.invalid && 'is-invalid', autosize && 'is-autosize')}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setCount(e.target.value.length);
          onChange?.(e);
        }}
      />
      {showCount && (
        <div className={cx('textarea-count', maxLength != null && count >= maxLength && 'is-full')} aria-live="polite">
          {count}
          {maxLength != null && ` / ${maxLength}`}
        </div>
      )}
    </div>
  );
}
