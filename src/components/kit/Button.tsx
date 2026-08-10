import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Spinner } from './Spinner';
import { cx } from './utils';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
  /** Text shown while loading (defaults to the children). */
  loadingText?: ReactNode;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: '',
  soft: 'btn-soft',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  link: 'btn-link',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading,
  loadingText,
  iconStart,
  iconEnd,
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('btn', VARIANT[variant], size !== 'md' && `btn-${size}`, fullWidth && 'btn-block', loading && 'is-loading', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={size === 'sm' ? 14 : 16} label={null} /> : iconStart}
      {loading && loadingText ? loadingText : children}
      {!loading && iconEnd}
    </button>
  );
}
