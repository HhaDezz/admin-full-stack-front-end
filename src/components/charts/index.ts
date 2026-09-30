/**
 * Charts kit: themed Recharts wrappers plus three light SVG/HTML charts.
 * Imported on its own (not through the UI kit barrel) so the chart library loads
 * only on pages that draw charts.
 */
export { LineChart, AreaChart } from './LineChart';
export type { TrendChartProps, AreaChartProps } from './LineChart';
export { BarChart } from './BarChart';
export type { BarChartProps } from './BarChart';
export { DonutChart } from './DonutChart';
export type { DonutChartProps, DonutSlice } from './DonutChart';
export { Gauge } from './Gauge';
export type { GaugeProps, GaugeBand } from './Gauge';
export { Heatmap } from './Heatmap';
export type { HeatmapProps } from './Heatmap';
export { FunnelChart } from './FunnelChart';
export type { FunnelChartProps, FunnelStep } from './FunnelChart';
export { ChartLegend, ChartTable, compactNumber, plainNumber, seriesColor } from './shared';
export type { ChartSeries } from './shared';
export { Sparkline } from '../kit/Sparkline';
