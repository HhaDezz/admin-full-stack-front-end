import { useId, type ReactNode } from 'react';
import {
  Area,
  AreaChart as RAreaChart,
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

/* ── LineChart and AreaChart: change over time, one or several series ── */

export interface TrendChartProps<T extends Record<string, unknown>> {
  data: T[];
  /** Field for the x axis (a date or category). */
  index: keyof T & string;
  /** Name of the x axis in the table view. */
  indexLabel?: string;
  series: ChartSeries[];
  'aria-label': string;
  height?: number;
  /** Tooltip and table values. Axis ticks are shortened (1.2K) automatically. */
  valueFormat?: (n: number) => string;
  /** How x values are written (e.g. dates). */
  indexFormat?: (v: unknown) => string;
  /** Shorter x labels for the axis (defaults to indexFormat). */
  tickFormat?: (v: unknown) => string;
  curve?: 'monotone' | 'linear' | 'step';
  /** Legend for two or more series (click to hide one). Default: on when there's more than one series. */
  legend?: boolean;
  /** A horizontal reference line, e.g. a target. */
  target?: { value: number; label: string };
  /** Start the y axis at zero (default true). */
  zeroBaseline?: boolean;
  loading?: boolean;
  empty?: ReactNode;
  /** Show the numbers as a table instead of the chart. */
  tableView?: boolean;
  className?: string;
}

export interface AreaChartProps<T extends Record<string, unknown>> extends TrendChartProps<T> {
  /** Stack the series on top of each other (parts of a whole). */
  stacked?: boolean;
}

function useTrend<T extends Record<string, unknown>>(p: TrendChartProps<T>, stacked?: boolean) {
  const { hidden, toggle } = useSeriesToggle(p.series);
  const keys = p.series.filter((s) => !hidden.has(s.key)).map((s) => s.key);
  const ticks = p.zeroBaseline === false ? undefined : niceTicks(Math.max(maxValue(p.data, keys, stacked), p.target?.value ?? 0));
  const showLegend = p.legend ?? p.series.length > 1;
  const valueFormat = p.valueFormat ?? plainNumber;
  const tickX = p.tickFormat ?? p.indexFormat;
  const common = {
    data: p.data,
    margin: { top: 12, right: 12, left: 0, bottom: 0 },
    accessibilityLayer: false,
  };
  const axes = (
    <>
      <CartesianGrid {...gridProps} />
      <XAxis
        dataKey={p.index as never}
        tickLine={false}
        axisLine={false}
        tick={axisTick}
        tickFormatter={tickX ? (v) => tickX(v) : undefined}
        interval="preserveStartEnd"
        minTickGap={24}
        tickMargin={8}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tick={axisTick}
        width={44}
        tickFormatter={(v: number) => compactNumber(v)}
        domain={ticks ? [0, ticks[ticks.length - 1]] : ['auto', 'auto']}
        ticks={ticks}
        allowDecimals={false}
      />
      <Tooltip
        cursor={{ stroke: 'var(--muted)', strokeWidth: 1 }}
        content={(t) => (
          <ChartTooltipContent
            active={t.active}
            payload={t.payload}
            label={t.label}
            series={p.series.filter((s) => !hidden.has(s.key))}
            valueFormat={valueFormat}
            labelFormat={p.indexFormat}
          />
        )}
      />
      {p.target && (
        <ReferenceLine
          y={p.target.value}
          stroke="var(--muted)"
          strokeDasharray="4 4"
          label={{ value: p.target.label, position: 'insideTopRight', fill: 'var(--muted)', fontSize: 12 }}
        />
      )}
    </>
  );
  const frame = (chart: ReactNode, shape: 'line' | 'rect') => (
    <ChartFrame
      aria-label={p['aria-label']}
      height={p.height ?? 280}
      loading={p.loading}
      isEmpty={!p.data.length}
      empty={p.empty}
      tableView={p.tableView}
      className={p.className}
      legend={showLegend ? <ChartLegend series={p.series} hidden={hidden} onToggle={toggle} shape={shape} /> : undefined}
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
        {chart as never}
      </ResponsiveContainer>
    </ChartFrame>
  );
  return { hidden, common, axes, frame };
}

export function LineChart<T extends Record<string, unknown>>(props: TrendChartProps<T>) {
  const { hidden, common, axes, frame } = useTrend(props);
  const motion = useChartMotion();
  return frame(
    <RLineChart {...common}>
      {axes}
      {props.series.map((s, i) => (
        <Line
          key={s.key}
          dataKey={s.key}
          name={s.label}
          hide={hidden.has(s.key)}
          type={props.curve ?? 'monotone'}
          stroke={seriesColor(s, i)}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={false}
          activeDot={{ r: 4.5, strokeWidth: 2, stroke: 'var(--surface)' }}
          {...motion}
        />
      ))}
    </RLineChart>,
    'line',
  );
}

export function AreaChart<T extends Record<string, unknown>>(props: AreaChartProps<T>) {
  const { hidden, common, axes, frame } = useTrend(props, props.stacked);
  const motion = useChartMotion();
  const gid = useId().replace(/:/g, '');
  return frame(
    <RAreaChart {...common}>
      <defs>
        {props.series.map((s, i) => (
          <linearGradient key={s.key} id={`${gid}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={seriesColor(s, i)} stopOpacity={props.stacked ? 0.22 : 0.16} />
            <stop offset="100%" stopColor={seriesColor(s, i)} stopOpacity={props.stacked ? 0.12 : 0.01} />
          </linearGradient>
        ))}
      </defs>
      {axes}
      {props.series.map((s, i) => (
        <Area
          key={s.key}
          dataKey={s.key}
          name={s.label}
          hide={hidden.has(s.key)}
          type={props.curve ?? 'monotone'}
          stackId={props.stacked ? 'stack' : undefined}
          stroke={seriesColor(s, i)}
          strokeWidth={2}
          fill={`url(#${gid}-${i})`}
          dot={false}
          activeDot={{ r: 4.5, strokeWidth: 2, stroke: 'var(--surface)' }}
          {...motion}
        />
      ))}
    </RAreaChart>,
    'rect',
  );
}
