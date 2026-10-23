import { BarChart } from '@/components/charts';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import { CHANNELS, REVENUE, money } from './_chartData';
import raw from './BarChart.tsx?raw';

// #region grouped
export function Grouped() {
  return (
    <div className="ex-chart">
      <BarChart
        aria-label="Revenue by stream, first half of 2026"
        data={REVENUE.slice(0, 6)}
        index="month"
        indexLabel="Month"
        valueFormat={money}
        series={[
          { key: 'subscriptions', label: 'Subscriptions' },
          { key: 'services', label: 'Services' },
        ]}
      />
    </div>
  );
}
// #endregion

// #region horizontal
export function Horizontal() {
  return (
    <div className="ex-chart">
      <BarChart
        aria-label="Revenue by channel"
        data={CHANNELS}
        index="channel"
        indexLabel="Channel"
        horizontal
        height={240}
        valueFormat={money}
        series={[{ key: 'revenue', label: 'Revenue' }]}
      />
    </div>
  );
}
// #endregion

// #region stacked
export function Stacked() {
  return (
    <div className="ex-chart">
      <BarChart
        aria-label="Revenue by stream per month"
        data={REVENUE}
        index="month"
        indexLabel="Month"
        stacked
        valueFormat={money}
        series={[
          { key: 'subscriptions', label: 'Subscriptions' },
          { key: 'services', label: 'Services' },
          { key: 'marketplace', label: 'Marketplace' },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'BarChart',
  group: 'Charts',
  status: 'new',
  importFrom: '@/components/charts',
  description:
    'Compare amounts across categories: side by side, stacked, or horizontal for rankings and long names. Thin bars with a rounded end, a 2 px gap in stacks and a tooltip with the total.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'stacked', default: false },
      { type: 'boolean', name: 'horizontal', default: false },
      { type: 'number', name: 'series', default: 2, min: 1, max: 3 },
      { type: 'number', name: 'months', default: 6, min: 3, max: 12 },
      { type: 'boolean', name: 'tableView', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <BarChart
          aria-label="Playground bar chart"
          data={REVENUE.slice(0, Number(v.months))}
          index="month"
          stacked={!!v.stacked}
          horizontal={!!v.horizontal}
          tableView={!!v.tableView}
          valueFormat={money}
          series={[
            { key: 'subscriptions', label: 'Subscriptions' },
            { key: 'services', label: 'Services' },
            { key: 'marketplace', label: 'Marketplace' },
          ].slice(0, Number(v.series))}
        />
      </div>
    ),
    code: ({ series: _s, months: _m, ...p }) =>
      jsx('BarChart', p, { stacked: false, horizontal: false, tableView: false }, undefined, [
        'aria-label="Revenue by stream"',
        'data={months}',
        'index="month"',
        'series={streams}',
      ]),
  },
  examples: [
    { id: 'grouped', title: 'Side by side', description: 'Two series per month.', Component: Grouped },
    { id: 'horizontal', title: 'Horizontal ranking', description: 'horizontal gives long category names room.', Component: Horizontal },
    { id: 'stacked', title: 'Stacked', description: 'Parts of each month’s total; the tooltip adds them up.', Component: Stacked },
  ],
  a11y: [
    'A named figure with a data table for screen readers; tableView shows it.',
    'Bars never rely on colour alone: the legend and tooltip name every series.',
  ],
  props: [
    { name: 'data / index / series', type: 'T[] / keyof T / ChartSeries[]', description: 'Rows, the category field and the bars.' },
    { name: 'stacked', type: 'boolean', defaultValue: 'false', description: 'Stack series.' },
    { name: 'horizontal', type: 'boolean', defaultValue: 'false', description: 'Bars grow sideways.' },
    { name: 'valueFormat / indexFormat', type: '(v) => string', description: 'Formats.' },
    { name: 'legend / height / loading / empty / tableView', type: '…', description: 'As on LineChart.' },
  ],
});
