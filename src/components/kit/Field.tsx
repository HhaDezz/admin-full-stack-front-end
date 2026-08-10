import { createContext, type ReactNode, useContext, useId } from 'react';
import { cx } from './utils';

/* ── Field: label, hint and error wired to the control inside ── */

interface FieldCtx {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required?: boolean;
  disabled?: boolean;
}

const FieldContext = createContext<FieldCtx | null>(null);

export const useField = () => useContext(FieldContext);

export interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  /** Error text. Also marks the control invalid. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Content at the right of the label row (e.g. "Forgot password?"). */
  labelAside?: ReactNode;
  /** Use an id you already have for the control. */
  id?: string;
  className?: string;
}

export function Field({ label, children, hint, error, required, disabled, labelAside, id, className }: FieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = hint ? `${fid}-hint` : undefined;
  const errId = error ? `${fid}-err` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext.Provider value={{ id: fid, describedBy, invalid: !!error, required, disabled }}>
      <div className={cx('field', error && 'is-invalid', disabled && 'is-disabled', className)}>
        <div className="field-label-row">
          <label htmlFor={fid} id={`${fid}-label`}>
            {label}
            {required && (
              <span className="field-req" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {labelAside}
        </div>
        {children}
        {error ? (
          <div id={errId} className="err" role="alert">
            {error}
          </div>
        ) : (
          hint && (
            <div id={hintId} className="hint">
              {hint}
            </div>
          )
        )}
      </div>
    </FieldContext.Provider>
  );
}
