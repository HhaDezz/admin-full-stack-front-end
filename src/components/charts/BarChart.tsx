import type { ReactNode } from 'react';
import { Bar, BarChart as RBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartFrame,
  ChartLegend,
  ChartTable,
  ChartTooltipContent,
  axisTick,
  compactNumber,
  gridProps,
  maxValue,
  niceTicks,
  plainNumber,
  seriesColor,
  useChartMotion,
  useSeriesToggle,
  type ChartSeries,
} from './shared';

/* ── BarChart: compare amounts across categories; grouped, stacked or horizontal ── */

export interface BarChartProps<T extends Record<string, unknown>> {
  data: T[];
  /** Field with the category name. */
  index: keyof T & string;
  indexLabel?: string;
  series: ChartSeries[];
  'aria-label': string;
  height?: number;
  /** Bars grow sideways; good for long category names and rankings. */
  horizontal?: boolean;
  /** Stack series (parts of a whole) instead of putting them side by side. */
  stacked?: boolean;
  valueFormat?: (n: number) => string;
  indexFormat?: (v: unknown) => string;
  legend?: boolean;
  loading?: boolean;
  empty?: ReactNode;
  tableView?: boolean;
  className?: string;
}

export function BarChart<T extends Record<string, unknown>>(p: BarChartProps<T>) {
  const { hidden, toggle } = useSeriesToggle(p.series);
  const motion = useChartMotion();
  const valueFormat = p.valueFormat ?? plainNumber;
  const showLegend = p.legend ?? p.series.length > 1;
  const visible = p.series.filter((s) => !hidden.has(s.key));
  const lastKey = visible[visible.length - 1]?.key;
  // Horizontal bars need room for their labels.
  const longest = p.horizontal
    ? Math.max(...p.data.map((d) => String(p.indexFormat ? p.indexFormat(d[p.index]) : d[p.index]).length), 4)
    : 0;
  const radius = (key: string): [number, number, number, number] => {
    // Only the data end is rounded; in a stack, only the outermost segment.
    if (p.stacked && key !== lastKey) return [0, 0, 0, 0];
    return p.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0];
  };
  const ticks = niceTicks(
    maxValue(
      p.data,
      visible.map((s) => s.key),
      p.stacked,
    ),
  );
  const valueAxis = {
    ticks,
    domain: [0, ticks[ticks.length - 1]],
    type: 'number' as const,
    tickLine: false,
    axisLine: false,
    tick: axisTick,
    tickFormatter: (v: number) => compactNumber(v),
    allowDecimals: false,
  };
  const categoryAxis = {
    type: 'category' as const,
    dataKey: p.index as never,
    tickLine: false,
    axisLine: false,
    tick: axisTick,
    tickFormatter: p.indexFormat ? (v: unknown) => p.indexFormat!(v) : undefined,
    interval: 0 as const,
    tickMargin: 8,
  };
  return (
    <ChartFrame
      aria-label={p['aria-label']}
      height={p.height ?? 280}
      loading={p.loading}
      isEmpty={!p.data.length}
      empty={p.empty}
      tableView={p.tableView}
      className={p.className}
      legend={showLegend ? <ChartLegend series={p.series} hidden={hidden} onToggle={toggle} /> : undefined}
      table={
        <ChartTable
          data={p.data}
          index={p.index}
          indexLabel={p.indexLabel}
          series={p.series}
          valueFormat={valueFormat}
          indexFormat={p.indexFormat}
          caption={p['aria-label']}
          visible={p.tableView}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart
          data={p.data}
          layout={p.horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
          barGap={2}
          barCategoryGap="28%"
          accessibilityLayer={false}
        >
          <CartesianGrid {...gridProps} vertical={!!p.horizontal} horizontal={!p.horizontal} />
          {p.horizontal ? (
            <>
              <XAxis {...valueAxis} />
              <YAxis {...categoryAxis} width={Math.min(160, longest * 7.2 + 12)} />
            </>
          ) : (
            <>
              <XAxis {...categoryAxis} interval="preserveStartEnd" minTickGap={12} />
              <YAxis {...valueAxis} width={44} />
            </>
          )}
          <Tooltip
            cursor={{ fill: 'color-mix(in srgb, var(--ink) 5%, transparent)' }}
            content={(t) => (
              <ChartTooltipContent
                active={t.active}
                payload={t.payload}
                label={t.label}
                series={visible}
                valueFormat={valueFormat}
                labelFormat={p.indexFormat}
                total={p.stacked}
              />
            )}
          />
          {p.series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              hide={hidden.has(s.key)}
              fill={seriesColor(s, i)}
              stackId={p.stacked ? 'stack' : undefined}
              maxBarSize={24}
              radius={radius(s.key)}
              stroke={p.stacked ? 'var(--surface)' : undefined}
              strokeWidth={p.stacked ? 2 : 0}
              activeBar={{ fillOpacity: 0.85 }}
              {...motion}
            />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
