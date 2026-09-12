import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useControlProps } from './_form';
import { cx, isRtl, useControllable } from './utils';

/* ── PinInput: one box per character, for one-time codes ── */

export interface PinInputProps {
  /** Number of boxes. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  /** Fires once every box is filled (e.g. submit the code). */
  onComplete?: (v: string) => void;
  /** numeric = digits only (shows the number keypad on phones). */
  type?: 'numeric' | 'alphanumeric';
  /** Hide the characters, like a password. */
  mask?: boolean;
  /** Put a gap after this many boxes (e.g. 3 for "123 456"). */
  groupAfter?: number;
  size?: 'md' | 'lg';
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  /** Names the group; each box is announced as "Digit 2 of 6". */
  'aria-label'?: string;
  name?: string;
  id?: string;
}

export function PinInput({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  type = 'numeric',
  mask,
  groupAfter,
  size = 'lg',
  disabled,
  invalid,
  autoFocus,
  'aria-label': label = 'Verification code',
  name,
  id,
}: PinInputProps) {
  const c = useControlProps({ id, disabled, invalid });
  const [code, setCode] = useControllable(value, defaultValue, onChange);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const auto = useId();
  const allowed = type === 'numeric' ? /[0-9]/ : /[0-9a-zA-Z]/;
  const chars = Array.from({ length }, (_, i) => code[i] ?? '');
  const unit = type === 'numeric' ? 'Digit' : 'Character';

  const commit = (next: string) => {
    const clean = next.slice(0, length);
    setCode(clean);
    if (clean.length === length && !clean.includes(' ')) onComplete?.(clean);
  };
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const put = (i: number, typed: string) => {
    const valid = [...typed].filter((ch) => allowed.test(ch)).map((ch) => (type === 'alphanumeric' ? ch.toUpperCase() : ch));
    if (!valid.length) return;
    const arr = [...chars];
    valid.forEach((ch, k) => {
      if (i + k < length) arr[i + k] = ch;
    });
    commit(arr.join('').replace(/\s+$/, ''));
    focus(i + valid.length);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    const rtl = isRtl(e.currentTarget);
    if (e.key === 'Backspace') {
      e.preventDefault();
      const arr = [...chars];
      if (arr[i]) arr[i] = '';
      else if (i > 0) {
        arr[i - 1] = '';
        focus(i - 1);
      }
      setCode(arr.join('').replace(/\s+$/, ''));
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const arr = [...chars];
      arr[i] = '';
      setCode(arr.join('').replace(/\s+$/, ''));
    } else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
      e.preventDefault();
      focus(i + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focus(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focus(length - 1);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>, i: number) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/[\s-]/g, '');
    // A whole code pasted anywhere fills from the start.
    put(text.length >= length ? 0 : i, text);
  };

  return (
    <div
      className={cx('pin', `pin-${size}`, c.invalid && 'is-invalid', c.disabled && 'is-disabled')}
      role="group"
      aria-label={label}
      aria-describedby={c['aria-describedby']}
    >
      {chars.map((ch, i) => (
        <span key={i} className="pin-cell-wrap">
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={i === 0 ? c.id : undefined}
            className="pin-cell"
            value={ch}
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoCapitalize="characters"
            autoFocus={autoFocus && i === 0}
            maxLength={length}
            disabled={c.disabled}
            aria-invalid={c['aria-invalid']}
            aria-label={`${unit} ${i + 1} of ${length}`}
            name={name ? `${name}-${i}` : undefined}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              const v = e.target.value;
              if (v.length > 1) {
                // A whole code from the phone's autofill fills every box; otherwise keep the newly typed character.
                if (v.length >= length) put(0, v);
                else put(i, v.startsWith(ch) ? v.slice(ch.length) : v);
              } else if (v === '') {
                const arr = [...chars];
                arr[i] = '';
                setCode(arr.join('').replace(/\s+$/, ''));
              } else put(i, v);
            }}
            onKeyDown={(e) => onKey(e, i)}
            onPaste={(e) => onPaste(e, i)}
          />
          {groupAfter && (i + 1) % groupAfter === 0 && i < length - 1 && <span className="pin-sep" aria-hidden="true" />}
        </span>
      ))}
      {name && <input type="hidden" name={name} value={code} id={`${auto}-value`} />}
    </div>
  );
}
