import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useCountUp } from '../../lib/motion';
import { Skeleton } from './Skeleton';
import { cx } from './utils';
import { Sparkline } from './Sparkline';

/* ── Stat card ── */

export interface StatCardProps {
  label: ReactNode;
  value: number;
  /** Format the (animated) number, e.g. currency. */
  format?: (n: number) => string;
  icon?: ReactNode;
  tone?: 'green' | 'gold' | 'terra' | 'red' | 'blue';
  /** Change vs. the previous period, in %. Positive is shown as good unless `invertDelta`. */
  delta?: number;
  deltaLabel?: ReactNode;
  /** A lower number is better (e.g. errors). */
  invertDelta?: boolean;
  trend?: number[];
  loading?: boolean;
  footnote?: ReactNode;
}

export function StatCard({
  label,
  value,
  format = (n) => Math.round(n).toLocaleString(),
  icon,
  tone = 'green',
  delta,
  deltaLabel = 'vs last period',
  invertDelta,
  trend,
  loading,
  footnote,
}: StatCardProps) {
  const shown = useCountUp(loading ? 0 : value);
  const good = delta == null ? undefined : invertDelta ? delta <= 0 : delta >= 0;
  return (
    <div className={cx('card', 'stat', `tone-${tone}`)}>
      <div className="stat-top">
        {icon && <div className="stat-ico">{icon}</div>}
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-mid">
        {loading ? (
          <Skeleton h={32} w="55%" />
        ) : (
          <div className="stat-value" aria-label={format(value)}>
            {format(shown)}
          </div>
        )}
        {trend && !loading && <Sparkline data={trend} tone={good === false ? 'danger' : 'brand'} />}
      </div>
      {delta != null && !loading && (
        <div className={cx('stat-delta', good ? 'is-good' : 'is-bad')}>
          {delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <b>
            {delta > 0 ? '+' : ''}
            {delta.toFixed(Math.abs(delta) < 10 ? 1 : 0)}%
          </b>
          <span>{deltaLabel}</span>
        </div>
      )}
      {footnote && <div className="stat-foot">{footnote}</div>}
    </div>
  );
}
