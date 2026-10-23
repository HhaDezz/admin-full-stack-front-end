import { AreaChart } from '@/components/charts';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import { REVENUE, TRAFFIC, money, shortDay } from './_chartData';
import raw from './AreaChart.tsx?raw';

// #region basic
export function Basic() {
  return (
    <div className="ex-chart">
      <AreaChart
        aria-label="Visitors per day"
        data={TRAFFIC}
        index="date"
        indexLabel="Date"
        indexFormat={shortDay}
        series={[{ key: 'visitors', label: 'Visitors' }]}
      />
    </div>
  );
}
// #endregion

// #region stacked
export function Stacked() {
  return (
    <div className="ex-chart">
      <AreaChart
        aria-label="Revenue by stream, 2026"
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
  name: 'AreaChart',
  group: 'Charts',
  status: 'new',
  importFrom: '@/components/charts',
  description:
    'A line with a soft fill to show volume over time, or stacked areas for parts of a whole. Same tooltip, legend and table view as LineChart.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'stacked', default: true },
      { type: 'number', name: 'series', default: 3, min: 1, max: 3 },
      { type: 'select', name: 'curve', options: ['monotone', 'linear', 'step'], default: 'monotone' },
      { type: 'boolean', name: 'tableView', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <AreaChart
          aria-label="Playground area chart"
          data={REVENUE}
          index="month"
          stacked={!!v.stacked}
          curve={v.curve as 'monotone'}
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
    code: ({ series: _s, ...p }) =>
      jsx('AreaChart', p, { stacked: false, curve: 'monotone', tableView: false }, undefined, [
        'aria-label="Revenue by stream"',
        'data={months}',
        'index="month"',
        'series={streams}',
        'valueFormat={money}',
      ]),
  },
  examples: [
    { id: 'basic', title: 'Volume over time', description: 'A light wash under the line.', Component: Basic },
    { id: 'stacked', title: 'Stacked', description: 'stacked adds the series up; the tooltip lists each one.', Component: Stacked },
  ],
  a11y: ['Same as LineChart: a named figure with a data table for screen readers, and tableView to show it.'],
  props: [
    { name: 'stacked', type: 'boolean', defaultValue: 'false', description: 'Stack the series.' },
    {
      name: '…',
      type: 'LineChart props',
      description: 'data, index, series, aria-label, formats, curve, target, legend, height, loading, empty, tableView.',
    },
  ],
});
