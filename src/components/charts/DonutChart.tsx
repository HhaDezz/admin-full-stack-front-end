import { useMemo, useState, type ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { ChartFrame, ChartTooltipContent, plainNumber, seriesColor, useChartMotion, type ChartSeries } from './shared';
import { cx } from '../kit/utils';

/* ── DonutChart: parts of a whole, with the total in the middle ── */

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutSlice[];
  'aria-label': string;
  /** Diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  thickness?: number;
  /** In the middle; default: the total. */
  centerLabel?: ReactNode;
  centerCaption?: ReactNode;
  valueFormat?: (n: number) => string;
  /** After this many slices the rest are folded into “Other” (colours are kept to six). */
  maxSlices?: number;
  /** List each slice with its value and share beside or under the ring. */
  legend?: 'side' | 'bottom' | false;
  loading?: boolean;
  empty?: ReactNode;
  tableView?: boolean;
  className?: string;
}

export function DonutChart({
  data,
  'aria-label': label,
  size = 200,
  thickness = 22,
  centerLabel,
  centerCaption = 'Total',
  valueFormat = plainNumber,
  maxSlices = 6,
  legend = 'side',
  loading,
  empty,
  tableView,
  className,
}: DonutChartProps) {
  const motion = useChartMotion();
  const [active, setActive] = useState<number | null>(null);
  const slices = useMemo(() => {
    const sorted = [...data].filter((d) => d.value > 0);
    if (sorted.length <= maxSlices) return sorted;
    const keep = [...sorted].sort((a, b) => b.value - a.value).slice(0, maxSlices - 1);
    const rest = sorted.filter((d) => !keep.includes(d)).reduce((a, d) => a + d.value, 0);
    return [...keep, { label: 'Other', value: rest, color: 'var(--muted)' }];
  }, [data, maxSlices]);
  const total = slices.reduce((a, d) => a + d.value, 0);
  const series: ChartSeries[] = slices.map((s, i) => ({ key: String(i), label: s.label, color: s.color }));
  const pct = (v: number) => `${total ? Math.round((v / total) * 100) : 0}%`;
  const colors = series.map((s, i) => seriesColor(s, i));
  const shown = active != null ? slices[active] : null;

  return (
    <ChartFrame
      aria-label={label}
      height={size}
      loading={loading}
      isEmpty={!slices.length}
      empty={empty}
      tableView={tableView}
      className={cx('donut', legend && `donut-legend-${legend}`, className)}
      table={
        <div className={tableView ? 'chart-table-wrap' : 'sr-only'}>
          <table className="table chart-table">
            <caption className="sr-only">{label}</caption>
            <thead>
              <tr>
                <th scope="col">Part</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Value
                </th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {slices.map((s) => (
                <tr key={s.label}>
                  <th scope="row">{s.label}</th>
                  <td style={{ textAlign: 'right' }}>{valueFormat(s.value)}</td>
                  <td style={{ textAlign: 'right' }}>{pct(s.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    >
      <div className="donut-body">
        <div className="donut-ring" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius={size / 2 - thickness}
                outerRadius={size / 2 - 2}
                paddingAngle={slices.length > 1 ? 1.5 : 0}
                cornerRadius={3}
                stroke="var(--surface)"
                strokeWidth={2}
                startAngle={90}
                endAngle={-270}
                activeShape={(props: object) => <Sector {...(props as object)} outerRadius={size / 2} />}
                onMouseEnter={(_, i) => setActive(i)}
                onMouseLeave={() => setActive(null)}
                {...motion}
                animationDuration={700}
              >
                {slices.map((s, i) => (
                  <Cell key={s.label} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip
                content={(t) => (
                  <ChartTooltipContent
                    active={t.active}
                    payload={t.payload?.map((p) => ({ ...p, dataKey: String(slices.findIndex((s) => s.label === p.name)) }))}
                    series={series}
                    valueFormat={(n) => `${valueFormat(n)} · ${pct(n)}`}
                  />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center-k">
            <b>{shown ? valueFormat(shown.value) : (centerLabel ?? valueFormat(total))}</b>
            <span>{shown ? shown.label : centerCaption}</span>
          </div>
        </div>
        {legend && (
          <ul className="donut-list">
            {slices.map((s, i) => (
              <li
                key={s.label}
                className={cx(active === i && 'is-active')}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="chart-key is-rect" style={{ background: colors[i] }} />
                <span className="donut-list-label">{s.label}</span>
                <b>{valueFormat(s.value)}</b>
                <span className="donut-list-pct">{pct(s.value)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ChartFrame>
  );
}
