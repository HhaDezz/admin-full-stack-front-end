import { useField } from './Field';

/** Props every text-like control takes from a surrounding <Field>. */
export function useControlProps(p: {
  id?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  'aria-describedby'?: string;
}) {
  const f = useField();
  const invalid = p.invalid ?? f?.invalid ?? false;
  return {
    id: p.id ?? f?.id,
    disabled: p.disabled ?? f?.disabled,
    required: p.required ?? f?.required,
    'aria-invalid': invalid || undefined,
    'aria-describedby': [p['aria-describedby'], f?.describedBy].filter(Boolean).join(' ') || undefined,
    invalid,
  };
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
