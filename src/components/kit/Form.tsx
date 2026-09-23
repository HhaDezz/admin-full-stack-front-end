import { cloneElement, createContext, isValidElement, useContext, useEffect, useState, type ReactElement, type ReactNode } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { errorFields, errorMessage } from '../../lib/api';
import { Alert } from './Alert';
import { Field } from './Field';
import { useUnsavedChanges } from './useUnsavedChanges';
import { cx } from './utils';

/* ── Schema forms: React Hook Form + Zod, wired to Field, the kit's inputs and the API's error format ── */

/**
 * useForm with a Zod schema. Fields validate when they lose focus, then again as the user
 * types once they have been flagged, so errors never appear while someone is still typing.
 */
export function useZodForm<S extends z.ZodType<FieldValues, FieldValues>>(
  schema: S,
  options?: Omit<UseFormProps<z.input<S>, unknown, z.output<S>>, 'resolver'>,
): UseFormReturn<z.input<S>, unknown, z.output<S>> {
  return useForm<z.input<S>, unknown, z.output<S>>({
    mode: 'onTouched',
    ...options,
    resolver: zodResolver(schema as never) as never,
  });
}

/**
 * Puts the API's errors on the form: field errors under their inputs, anything else at the
 * top. Our API answers { message, data: { field: 'message' } }.
 */
export function applyServerErrors<T extends FieldValues>(form: UseFormReturn<T, unknown, never> | UseFormReturn<T>, err: unknown) {
  // Errors that already carry field messages (e.g. AuthError) or raw API errors.
  const fields =
    err && typeof err === 'object' && 'fields' in err ? ((err as { fields: Record<string, string> }).fields ?? {}) : errorFields(err);
  const known = Object.keys(form.getValues() ?? {});
  let placed = false;
  for (const [name, message] of Object.entries(fields)) {
    if (known.includes(name)) {
      (form as UseFormReturn<T>).setError(name as FieldPath<T>, { type: 'server', message }, { shouldFocus: !placed });
      placed = true;
    }
  }
  if (!placed) (form as UseFormReturn<T>).setError('root.server' as FieldPath<T>, { type: 'server', message: errorMessage(err) });
}

const GuardCtx = createContext(false);

export interface FormProps<TIn extends FieldValues, TOut> {
  form: UseFormReturn<TIn, unknown, TOut>;
  /** Called with the parsed values. Throw (or reject) and the API's errors appear on the form. */
  onSubmit: (values: TOut) => unknown | Promise<unknown>;
  children: ReactNode;
  /** Ask before leaving the page with unsaved changes (in-app links and closing the tab). */
  guard?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function Form<TIn extends FieldValues, TOut>({
  form,
  onSubmit,
  children,
  guard,
  className,
  id,
  'aria-label': label,
}: FormProps<TIn, TOut>) {
  const prompt = useUnsavedChanges(!!guard && form.formState.isDirty && !form.formState.isSubmitting);
  // After a successful save the saved values become the new "clean" state.
  const { isSubmitSuccessful, submitCount } = form.formState;
  useEffect(() => {
    if (isSubmitSuccessful) form.reset(form.getValues(), { keepValues: true, keepIsSubmitSuccessful: true, keepSubmitCount: true });
  }, [form, isSubmitSuccessful, submitCount]);
  return (
    <FormProvider {...(form as unknown as UseFormReturn<FieldValues>)}>
      <GuardCtx.Provider value={!!guard}>
        <form
          id={id}
          aria-label={label}
          noValidate
          className={cx('kform', className)}
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await onSubmit(values);
            } catch (err) {
              // Errors set here also mark the submit as unsuccessful, so the guard stays on.
              applyServerErrors(form as unknown as UseFormReturn<FieldValues>, err);
            }
          })}
        >
          {children}
        </form>
      </GuardCtx.Provider>
      {prompt}
    </FormProvider>
  );
}

/** The form-level error (from the server or a refine on the whole schema). */
export function FormError({ title }: { title?: ReactNode }) {
  const { formState } = useFormContext();
  const message = (formState.errors.root?.server?.message ?? formState.errors.root?.message) as string | undefined;
  if (!message) return null;
  return (
    <Alert tone="danger" title={title}>
      {message}
    </Alert>
  );
}

type ValueProp = 'value' | 'checked';

export interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  labelAside?: ReactNode;
  /**
   * One input. It receives value (or checked), onChange, onBlur, name and ref. onChange may be
   * called with an event or a plain value, so Input, Switch, SearchSelect and the pickers all work.
   */
  children?: ReactElement;
  /** Which prop carries the value: 'checked' for Checkbox and Switch. */
  valueProp?: ValueProp;
  /** Full control instead of children. */
  render?: (field: ControllerRenderProps<T, FieldPath<T>> & { invalid: boolean }) => ReactNode;
  /** No label row: for a Checkbox or Switch that labels itself. The label is still used for the error. */
  bare?: boolean;
  className?: string;
}

export function FormField<T extends FieldValues = FieldValues>({
  name,
  label,
  hint,
  required,
  disabled,
  labelAside,
  children,
  valueProp = 'value',
  render,
  bare,
  className,
}: FormFieldProps<T>) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => {
        const invalid = !!fieldState.error;
        let input: ReactNode = null;
        if (render) input = render({ ...field, invalid });
        else if (isValidElement<Record<string, unknown>>(children)) {
          const own = children.props;
          input = cloneElement(children, {
            name: field.name,
            ref: field.ref,
            [valueProp]: valueProp === 'checked' ? !!field.value : (field.value ?? ''),
            onChange: (v: unknown) => {
              field.onChange(v);
              (own.onChange as ((x: unknown) => void) | undefined)?.(v);
            },
            onBlur: (e: unknown) => {
              field.onBlur();
              (own.onBlur as ((x: unknown) => void) | undefined)?.(e);
            },
            disabled: field.disabled ?? own.disabled,
            invalid,
          });
        }
        if (bare) {
          const errId = `${field.name}-err`;
          return (
            <div className={cx('field', invalid && 'is-invalid', className)}>
              {input}
              {fieldState.error?.message && (
                <div className="err" id={errId} role="alert">
                  {fieldState.error.message}
                </div>
              )}
            </div>
          );
        }
        return (
          <Field
            label={label}
            hint={hint}
            error={fieldState.error?.message}
            required={required}
            disabled={field.disabled}
            labelAside={labelAside}
            className={className}
          >
            {input}
          </Field>
        );
      }}
    />
  );
}

/* ── Layout ── */

export interface FormSectionProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Title beside the fields (settings pages) or above them. */
  layout?: 'side' | 'stacked';
  /** Heading level of the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
}

/** A titled group of fields. In "side" layout the title sits to the left on wide screens. */
export function FormSection({ title, description, children, layout = 'side', headingLevel = 3 }: FormSectionProps) {
  const H = `h${headingLevel}` as 'h3';
  return (
    <section className={cx('form-section', `is-${layout}`)}>
      <div className="form-section-head">
        <H>{title}</H>
        {description && <p>{description}</p>}
      </div>
      <div className="form-section-body">{children}</div>
    </section>
  );
}

/** Save / cancel row. Shows "Unsaved changes" while the form is dirty; sticks to the bottom when sticky. */
export function FormActions({ children, sticky, status }: { children: ReactNode; sticky?: boolean; status?: ReactNode }) {
  const ctx = useFormContext();
  const guard = useContext(GuardCtx);
  const dirty = ctx?.formState.isDirty;
  const [saved, setSaved] = useState(false);
  const ok = ctx?.formState.isSubmitSuccessful;
  useEffect(() => {
    if (!ok) return;
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 2400);
    return () => clearTimeout(t);
  }, [ok, ctx?.formState.submitCount]);
  return (
    <div className={cx('form-actions', sticky && 'is-sticky')}>
      <span className="form-status" role="status" aria-live="polite">
        {status ?? (dirty ? (guard ? 'Unsaved changes' : '') : saved ? 'Saved' : '')}
      </span>
      {children}
    </div>
  );
}
