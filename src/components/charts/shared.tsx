import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';
import { useShouldReduceMotion } from '../../lib/motion';
import { Skeleton } from '../kit/Skeleton';
import { cx } from '../kit/utils';

/* Shared pieces of the charts kit: series colours, legend, tooltip, frame and table view. */

export interface ChartSeries {
  /** Field in each data row. */
  key: string;
  label: string;
  /** Any CSS colour. Default: the next --chart-N token, by the series' place in this list. */
  color?: string;
}

/** Series colours come from tokens in a fixed order, so a series keeps its colour when others are hidden. */
export const seriesColor = (s: ChartSeries, i: number) => s.color ?? `var(--chart-${(i % 6) + 1})`;

const compactFmt = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
const plainFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
/** 1,284 · 12.9K · 4.2M */
export const compactNumber = (n: number) => (Math.abs(n) >= 1000 ? compactFmt.format(n) : plainFmt.format(n));
export const plainNumber = (n: number) => plainFmt.format(n);

/** Recharts animation that follows the motion settings (off with reduced motion). */
export function useChartMotion() {
  const reduce = useShouldReduceMotion();
  return { isAnimationActive: !reduce, animationDuration: 600, animationEasing: 'ease-out' as const };
}

/** Clicking a legend entry hides or shows that series; colours don't move. */
export function useSeriesToggle(series: ChartSeries[]) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(key)) next.delete(key);
      // Never hide the last visible series.
      else if (series.length - next.size > 1) next.add(key);
      return next;
    });
  return { hidden, toggle };
}

export function ChartLegend({
  series,
  hidden,
  onToggle,
  shape = 'rect',
}: {
  series: ChartSeries[];
  hidden?: Set<string>;
  onToggle?: (key: string) => void;
  shape?: 'rect' | 'line';
}) {
  return (
    <ul className="chart-legend" aria-label="Legend">
      {series.map((s, i) => {
        const off = hidden?.has(s.key);
        const key = <span className={cx('chart-key', `is-${shape}`)} style={{ background: seriesColor(s, i) }} aria-hidden="true" />;
        return (
          <li key={s.key}>
            {onToggle ? (
              <button
                type="button"
                className={cx('chart-legend-item', off && 'is-off')}
                aria-pressed={!off}
                onClick={() => onToggle(s.key)}
              >
                {key}
                {s.label}
              </button>
            ) : (
              <span className="chart-legend-item">
                {key}
                {s.label}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

interface TooltipRow {
  dataKey?: string | number | ((obj: unknown) => unknown);
  name?: string | number;
  value?: unknown;
  color?: string;
  payload?: Record<string, unknown>;
}

/** Tooltip body: the value leads, the series name follows, each keyed with a short line. */
export function ChartTooltipContent({
  active,
  payload,
  label,
  series,
  valueFormat = plainNumber,
  labelFormat,
  total,
}: {
  active?: boolean;
  payload?: readonly TooltipRow[];
  label?: unknown;
  series: ChartSeries[];
  valueFormat?: (n: number) => string;
  labelFormat?: (v: unknown) => string;
  total?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const rows = series.map((s, i) => ({ s, i, row: payload.find((p) => p.dataKey === s.key) })).filter((r) => r.row && r.row.value != null);
  const sum = rows.reduce((a, r) => a + Number(r.row!.value), 0);
  return (
    <div className="chart-tip">
      {label != null && label !== '' && <div className="chart-tip-label">{labelFormat ? labelFormat(label) : String(label)}</div>}
      {rows.map(({ s, i, row }) => (
        <div key={s.key} className="chart-tip-row">
          <span className="chart-key is-line" style={{ background: seriesColor(s, i) }} aria-hidden="true" />
          <b>{valueFormat(Number(row!.value))}</b>
          <span>{s.label}</span>
        </div>
      ))}
      {total && rows.length > 1 && (
        <div className="chart-tip-row is-total">
          <span className="chart-key" aria-hidden="true" />
          <b>{valueFormat(sum)}</b>
          <span>Total</span>
        </div>
      )}
    </div>
  );
}

/** A plain table of the chart's numbers: hidden for screen readers by default, or shown instead of the chart. */
export function ChartTable<T extends Record<string, unknown>>({
  data,
  index,
  indexLabel,
  series,
  valueFormat = plainNumber,
  indexFormat,
  caption,
  visible,
}: {
  data: T[];
  index: string;
  indexLabel?: string;
  series: ChartSeries[];
  valueFormat?: (n: number) => string;
  indexFormat?: (v: unknown) => string;
  caption: string;
  visible?: boolean;
}) {
  return (
    <div className={visible ? 'chart-table-wrap' : 'sr-only'}>
      <table className="table chart-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{indexLabel ?? index}</th>
            {series.map((s) => (
              <th key={s.key} scope="col" style={{ textAlign: 'right' }}>
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, r) => (
            <tr key={r}>
              <th scope="row">{indexFormat ? indexFormat(row[index]) : String(row[index])}</th>
              {series.map((s) => (
                <td key={s.key} style={{ textAlign: 'right' }}>
                  {row[s.key] == null ? '–' : valueFormat(Number(row[s.key]))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface FrameProps {
  'aria-label': string;
  height: number;
  loading?: boolean;
  isEmpty: boolean;
  empty?: ReactNode;
  legend?: ReactNode;
  /** The chart; hidden from screen readers, which get the table instead. */
  children: ReactNode;
  table: ReactNode;
  tableView?: boolean;
  className?: string;
}

/** Wraps every chart: legend row, loading skeleton, empty state, and the table for screen readers. */
export function ChartFrame({
  'aria-label': label,
  height,
  loading,
  isEmpty,
  empty,
  legend,
  children,
  table,
  tableView,
  className,
}: FrameProps) {
  // The drawing is hidden from assistive tech (the table stands in), so nothing in it may take focus.
  const plot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = plot.current;
    if (!el) return;
    const strip = () => el.querySelectorAll('[tabindex]:not([tabindex="-1"])').forEach((n) => n.setAttribute('tabindex', '-1'));
    strip();
    const mo = new MutationObserver(strip);
    mo.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['tabindex'] });
    return () => mo.disconnect();
  });
  const body = useMemo(() => {
    if (loading) return <Skeleton h={height} r={10} />;
    if (isEmpty)
      return (
        <div className="chart-empty" style={{ height }}>
          {empty ?? (
            <>
              <BarChart3 size={22} aria-hidden="true" />
              <span>No data for this period</span>
            </>
          )}
        </div>
      );
    return null;
  }, [loading, isEmpty, empty, height]);
  return (
    <figure className={cx('chart', className)} aria-label={label} aria-busy={loading || undefined}>
      {legend && !loading && !isEmpty && !tableView && legend}
      {body ??
        (tableView ? (
          table
        ) : (
          <>
            <div ref={plot} className="chart-plot" style={{ height }} aria-hidden="true">
              {children}
            </div>
            {table}
          </>
        ))}
    </figure>
  );
}

/** Clean axis ticks: 0 and four steps of 1, 2, 2.5 or 5 × 10ⁿ that cover the largest value. */
export function niceTicks(max: number, steps = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / steps;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const n = Math.ceil(max / step);
  return Array.from({ length: n + 1 }, (_, i) => +(i * step).toPrecision(12));
}

/** Largest value to plot: per row, the biggest series, or their sum when stacked. */
export function maxValue(data: Record<string, unknown>[], keys: string[], stacked?: boolean): number {
  let m = 0;
  for (const row of data) {
    const vals = keys.map((k) => Number(row[k]) || 0);
    m = Math.max(m, stacked ? vals.reduce((a, b) => a + b, 0) : Math.max(...vals, 0));
  }
  return m;
}

/** Axis and grid styling shared by the cartesian charts. */
export const axisTick = { fill: 'var(--muted)', fontSize: 12 };
export const gridProps = { stroke: 'var(--chart-grid)', vertical: false, strokeDasharray: undefined };
