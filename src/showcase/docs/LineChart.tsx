import { LineChart } from '@/components/charts';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import { TRAFFIC, shortDay } from './_chartData';
import raw from './LineChart.tsx?raw';

// #region basic
export function Basic() {
  return (
    <div className="ex-chart">
      <LineChart
        aria-label="Sign-ups per day, October"
        data={TRAFFIC}
        index="date"
        indexLabel="Date"
        indexFormat={shortDay}
        series={[{ key: 'signups', label: 'Sign-ups' }]}
        target={{ value: 180, label: 'Goal 180' }}
      />
    </div>
  );
}
// #endregion

// #region compare
export function Compare() {
  return (
    <div className="ex-chart">
      <LineChart
        aria-label="Sign-ups and trials per day"
        data={TRAFFIC}
        index="date"
        indexLabel="Date"
        indexFormat={shortDay}
        series={[
          { key: 'signups', label: 'Sign-ups' },
          { key: 'trials', label: 'Trials started' },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'LineChart',
  group: 'Charts',
  status: 'new',
  importFrom: '@/components/charts',
  description:
    'Change over time for one or a few series. Themed axes and grid, a crosshair tooltip with every series, a legend that hides series, an optional target line, and a data table for screen readers.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'series', default: 2, min: 1, max: 3 },
      { type: 'select', name: 'curve', options: ['monotone', 'linear', 'step'], default: 'monotone' },
      { type: 'number', name: 'height', default: 280, min: 160, max: 400, step: 20 },
      { type: 'boolean', name: 'target', default: false },
      { type: 'boolean', name: 'loading', default: false },
      { type: 'boolean', name: 'tableView', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <LineChart
          aria-label="Playground line chart"
          data={TRAFFIC}
          index="date"
          indexFormat={shortDay}
          curve={v.curve as 'monotone'}
          height={Number(v.height)}
          loading={!!v.loading}
          tableView={!!v.tableView}
          target={v.target ? { value: 180, label: 'Goal' } : undefined}
          series={[
            { key: 'signups', label: 'Sign-ups' },
            { key: 'trials', label: 'Trials' },
            { key: 'visitors', label: 'Visitors' },
          ].slice(0, Number(v.series))}
        />
      </div>
    ),
    code: ({ series, target, ...p }) =>
      jsx('LineChart', p, { curve: 'monotone', height: 280, loading: false, tableView: false }, undefined, [
        'aria-label="Sign-ups per day"',
        'data={days}',
        'index="date"',
        `series={[${['signups', 'trials', 'visitors']
          .slice(0, Number(series))
          .map((k) => `{ key: '${k}', label: '…' }`)
          .join(', ')}]}`,
        ...(target ? ["target={{ value: 180, label: 'Goal' }}"] : []),
      ]),
  },
  examples: [
    {
      id: 'basic',
      title: 'One series with a target',
      description: 'A single series needs no legend; the target is a dashed reference line.',
      Component: Basic,
    },
    {
      id: 'compare',
      title: 'Two series',
      description: 'Click a legend entry to hide a series; the other keeps its colour.',
      Component: Compare,
    },
  ],
  a11y: [
    'The figure is named by aria-label; the drawing is hidden from screen readers, which get a data table instead.',
    'tableView shows that table on screen, for people who prefer numbers or can’t tell colours apart.',
    'Series colours come from --chart-1…6, checked for colour-blind separation in light and dark mode.',
    'Animations turn off with reduced motion.',
  ],
  props: [
    { name: 'data / index', type: 'T[] / keyof T', description: 'Rows, and the field for the x axis.' },
    { name: 'series', type: '{ key, label, color? }[]', description: 'Lines, in a fixed colour order.' },
    { name: 'aria-label', type: 'string', description: 'What the chart shows.' },
    { name: 'valueFormat / indexFormat / tickFormat', type: '(v) => string', description: 'How values and x labels are written.' },
    { name: 'indexLabel', type: 'string', description: 'Header of the first column in the table view.' },
    { name: 'curve', type: "'monotone' | 'linear' | 'step'", defaultValue: "'monotone'", description: 'Line shape.' },
    { name: 'target', type: '{ value, label }', description: 'Horizontal reference line.' },
    { name: 'legend', type: 'boolean', defaultValue: 'series > 1', description: 'Clickable legend.' },
    { name: 'zeroBaseline', type: 'boolean', defaultValue: 'true', description: 'Start the y axis at 0.' },
    { name: 'height', type: 'number', defaultValue: '280', description: 'Plot height in px.' },
    { name: 'loading / empty / tableView', type: 'boolean / ReactNode / boolean', description: 'States.' },
  ],
});
