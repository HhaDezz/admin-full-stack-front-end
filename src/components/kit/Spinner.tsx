import { Loader2 } from 'lucide-react';
import { cx } from './utils';

/* ── Spinner ── */

export interface SpinnerProps {
  size?: number;
  /** Read by screen readers. Pass `null` when a parent already announces loading. */
  label?: string | null;
  className?: string;
}

export function Spinner({ size = 16, label = 'Loading', className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cx('spin', className)}
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
    />
  );
}
