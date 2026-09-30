import { useEffect, useState, type ReactNode } from 'react';
import { useShouldReduceMotion } from '../../lib/motion';
import { cx } from '../kit/utils';

/* ── Gauge: one value against a range, with colour bands for good, warning and critical ── */

export interface GaugeBand {
  /** From this value up (until the next band). */
  from: number;
  tone: 'brand' | 'success' | 'warning' | 'danger';
}

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  /** Text under the number, e.g. "of 100 GB". */
  caption?: ReactNode;
  valueFormat?: (n: number) => string;
  /** Colour bands; the fill takes the colour of the band the value is in. Default: one brand band. */
  bands?: GaugeBand[];
  /** Width in px (height is about 0.62 × width). */
  size?: number;
  /** Show the min and max under the ends. */
  showRange?: boolean;
  className?: string;
}

const TONE = { brand: 'var(--chart-1)', success: 'var(--ok)', warning: 'var(--warn)', danger: 'var(--danger)' };

export function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  caption,
  valueFormat = (n) => `${Math.round(n)}`,
  bands = [{ from: min, tone: 'brand' }],
  size = 220,
  showRange = true,
  className,
}: GaugeProps) {
  const reduce = useShouldReduceMotion();
  const clamped = Math.min(max, Math.max(min, value));
  const target = (clamped - min) / (max - min || 1);
  // Sweep in on first paint (skipped with reduced motion).
  const [t, setT] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return setT(target);
    const id = requestAnimationFrame(() => setT(target));
    return () => cancelAnimationFrame(id);
  }, [target, reduce]);

  const band = [...bands].sort((a, b) => b.from - a.from).find((b) => clamped >= b.from) ?? bands[0];
  const stroke = 14;
  const r = 100 - stroke / 2;
  // 180° arc from left to right, as a path so stroke-dasharray can fill it.
  const arc = `M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`;
  const length = Math.PI * r;

  return (
    <div
      className={cx('gauge', className)}
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={`${valueFormat(clamped)}${typeof caption === 'string' ? ` ${caption}` : ''}`}
      style={{ width: size }}
    >
      <svg viewBox="0 0 200 112" aria-hidden="true">
        <path
          d={arc}
          className="gauge-track"
          style={{ stroke: `color-mix(in srgb, ${TONE[band.tone]} 16%, var(--surface-2))` }}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arc}
          className="gauge-fill"
          stroke={TONE[band.tone]}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - t)}
          style={{ transition: reduce ? undefined : 'stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.3s' }}
        />
      </svg>
      <div className="gauge-text">
        <b>{valueFormat(clamped)}</b>
        {caption && <span>{caption}</span>}
      </div>
      {showRange && (
        <div className="gauge-range" aria-hidden="true">
          <span>{valueFormat(min)}</span>
          <span>{valueFormat(max)}</span>
        </div>
      )}
    </div>
  );
}
