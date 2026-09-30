import { useEffect, useState } from 'react';
import { useShouldReduceMotion } from '../../lib/motion';
import { plainNumber } from './shared';
import { cx } from '../kit/utils';

/* ── FunnelChart: how many make it through each step (sign-up, checkout, onboarding) ── */

export interface FunnelStep {
  label: string;
  value: number;
}

export interface FunnelChartProps {
  steps: FunnelStep[];
  'aria-label': string;
  valueFormat?: (n: number) => string;
  /** Show the drop between steps. */
  showDropOff?: boolean;
  color?: string;
  className?: string;
}

export function FunnelChart({
  steps,
  'aria-label': label,
  valueFormat = plainNumber,
  showDropOff = true,
  color = 'var(--chart-1)',
  className,
}: FunnelChartProps) {
  const reduce = useShouldReduceMotion();
  const [grown, setGrown] = useState(reduce);
  useEffect(() => {
    if (reduce) return;
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, [reduce]);
  const top = steps[0]?.value || 1;
  const pct = (v: number, of: number) => `${of ? Math.round((v / of) * 1000) / 10 : 0}%`;

  return (
    <figure className={cx('funnel', className)} aria-label={label}>
      <ol className="funnel-steps">
        {steps.map((s, i) => {
          const prev = steps[i - 1];
          return (
            <li key={s.label} className="funnel-step">
              <div className="funnel-head">
                <span className="funnel-label">{s.label}</span>
                <span className="funnel-value">
                  <b>{valueFormat(s.value)}</b>
                  <span>{pct(s.value, top)} of all</span>
                </span>
              </div>
              <div className="funnel-track" aria-hidden="true">
                <span
                  className="funnel-bar"
                  style={{
                    width: grown ? `${Math.max(1.5, (s.value / top) * 100)}%` : 0,
                    background: color,
                    transitionDelay: reduce ? undefined : `${i * 80}ms`,
                  }}
                />
              </div>
              {showDropOff && prev && (
                <div className="funnel-drop">
                  {pct(s.value, prev.value)} continued · {valueFormat(prev.value - s.value)} dropped
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
