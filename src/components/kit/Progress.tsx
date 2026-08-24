import type { CSSProperties, ReactNode } from 'react';
import { cx } from './utils';
import type { Tone } from './types';

/* ── Progress ── */

export interface ProgressProps {
  /** 0 – max. Leave undefined for an indeterminate bar. */
  value?: number;
  max?: number;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  label?: ReactNode;
  showValue?: boolean;
  /** Accessible name when there is no visible label. */
  'aria-label'?: string;
}

export function Progress({ value, max = 100, tone = 'brand', size = 'md', label, showValue, 'aria-label': ariaLabel }: ProgressProps) {
  const indeterminate = value == null;
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const name = ariaLabel ?? (typeof label === 'string' ? label : 'Progress');
  return (
    <div className={cx('progress', `progress-${size}`, `tone-${tone}`)}>
      {(label || showValue) && (
        <div className="progress-top">
          <span>{label}</span>
          {showValue && !indeterminate && <span className="progress-val">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cx('progress-track', indeterminate && 'is-indeterminate')}
        role="progressbar"
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
      >
        <i style={{ width: indeterminate ? undefined : `${pct}%` }} />
      </div>
    </div>
  );
}

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  tone?: Tone;
  /** Centre content. Defaults to the percentage. */
  children?: ReactNode;
  'aria-label'?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 72,
  thickness = 7,
  tone = 'brand',
  children,
  'aria-label': ariaLabel = 'Progress',
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={cx('ring', `tone-${tone}`)}
      style={{ width: size, height: size } as CSSProperties}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={thickness} className="ring-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={thickness}
          className="ring-bar"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-label" style={{ fontSize: Math.max(11, size * 0.22) }}>
        {children ?? `${Math.round(pct)}%`}
      </span>
    </div>
  );
}
