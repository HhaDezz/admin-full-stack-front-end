import { useEffect, useId, useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from './Input';

/* ── Password input ── */

export interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

export const defaultPasswordRules: PasswordRule[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Upper and lower case letters', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: 'A number', test: (p) => /\d/.test(p) },
  { label: 'A symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/** 0 (empty) – 4 (strong). Length counts most; variety adds the rest. */
export function passwordScore(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (kinds >= 3) s++;
  if (kinds === 4 && pw.length >= 10) s++;
  if (/^(.)\1+$/.test(pw) || /^(password|12345678|qwerty)/i.test(pw)) s = 1;
  return Math.max(1, Math.min(4, s)) as 1 | 2 | 3 | 4;
}

const STRENGTH = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'suffix' | 'clearable'> {
  /** Shows a strength bar under the field. */
  strength?: boolean;
  /** Shows a checklist of rules (pass `true` for the defaults). */
  rules?: boolean | PasswordRule[];
}

export function PasswordInput({ strength, rules, value, defaultValue, onChange, ...rest }: PasswordInputProps) {
  const [shown, setShown] = useState(false);
  const [pw, setPw] = useState(String(value ?? defaultValue ?? ''));
  useEffect(() => {
    if (value !== undefined) setPw(String(value));
  }, [value]);
  const score = passwordScore(pw);
  const list = rules === true ? defaultPasswordRules : rules || [];
  const meterId = useId();
  return (
    <div className="password">
      <Input
        {...rest}
        type={shown ? 'text' : 'password'}
        value={value}
        defaultValue={defaultValue}
        autoComplete={rest.autoComplete ?? 'current-password'}
        aria-describedby={[rest['aria-describedby'], strength ? meterId : undefined].filter(Boolean).join(' ') || undefined}
        onChange={(e) => {
          setPw(e.target.value);
          onChange?.(e);
        }}
        suffix={
          <button
            type="button"
            className="control-icon-btn"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
          >
            {shown ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      {strength && (
        <div className={`pw-meter s-${score}`} id={meterId}>
          <div className="pw-bars" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <i key={i} className={i <= score ? 'on' : undefined} />
            ))}
          </div>
          <span className="pw-label">{pw ? `Strength: ${STRENGTH[score]}` : 'Enter a password'}</span>
        </div>
      )}
      {list.length > 0 && (
        <ul className="pw-rules" aria-label="Password requirements">
          {list.map((r) => {
            const ok = r.test(pw);
            return (
              <li key={r.label} className={ok ? 'is-ok' : undefined}>
                {ok ? <Check size={13} /> : <span className="pw-dot" />}
                {r.label}
                <span className="sr-only">{ok ? ' (met)' : ' (not met)'}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
