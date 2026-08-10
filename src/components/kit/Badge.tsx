import type { CSSProperties, ReactNode } from 'react';
import { hue } from '../../lib/format';
import { cx } from './utils';

/* ── Badge ── */

export type BadgeTone = 'neutral' | 'brand' | 'ok' | 'warn' | 'danger' | 'info' | 'gold';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: 'soft' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  /** Leading status dot. */
  dot?: boolean;
  /** Stable colour picked from a string (e.g. a role name). */
  seed?: string;
}

export function Badge({ children, tone, variant = 'soft', size = 'md', dot, seed }: BadgeProps) {
  return (
    <span
      className={cx(
        'badge',
        seed ? 'badge-tone' : tone && tone !== 'neutral' && `badge-${tone}`,
        variant !== 'soft' && `badge-${variant}`,
        size === 'sm' && 'badge-sm',
      )}
      style={seed ? ({ '--h': hue(seed) } as CSSProperties) : undefined}
    >
      {dot && <i className="badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
