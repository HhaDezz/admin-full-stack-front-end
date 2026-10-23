import { DonutChart } from '@/components/charts';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import { CHANNELS, money } from './_chartData';
import raw from './DonutChart.tsx?raw';

// #region channels
export function Channels() {
  return (
    <div className="ex-chart">
      <DonutChart
        aria-label="Revenue by channel"
        data={CHANNELS.map((c) => ({ label: c.channel, value: c.revenue }))}
        valueFormat={money}
        centerCaption="Revenue"
      />
    </div>
  );
}
// #endregion

// #region compact
export function Compact() {
  return (
    <div style={{ width: 240 }}>
      <DonutChart
        aria-label="Storage used"
        size={160}
        thickness={16}
        legend="bottom"
        centerLabel="72%"
        centerCaption="of 100 GB"
        valueFormat={(n) => `${n} GB`}
        data={[
          { label: 'Files', value: 41 },
          { label: 'Backups', value: 22 },
          { label: 'Logs', value: 9 },
          { label: 'Free', value: 28, color: 'var(--surface-2)' },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'DonutChart',
  group: 'Charts',
  status: 'new',
  importFrom: '@/components/charts',
  description:
    'Parts of a whole with the total in the middle. Hover a slice or a row to see its value; more than six slices fold into “Other” so colours stay distinct.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'legend', options: ['side', 'bottom', 'none'], default: 'side' },
      { type: 'number', name: 'size', default: 200, min: 120, max: 260, step: 20 },
      { type: 'number', name: 'thickness', default: 22, min: 10, max: 40, step: 2 },
      { type: 'number', name: 'maxSlices', default: 6, min: 3, max: 6 },
      { type: 'boolean', name: 'tableView', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(520px, 100%)' }}>
        <DonutChart
          aria-label="Playground donut"
          legend={v.legend === 'none' ? false : (v.legend as 'side')}
          size={Number(v.size)}
          thickness={Number(v.thickness)}
          maxSlices={Number(v.maxSlices)}
          tableView={!!v.tableView}
          valueFormat={money}
          data={CHANNELS.map((c) => ({ label: c.channel, value: c.revenue }))}
        />
      </div>
    ),
    code: ({ legend, ...p }) =>
      jsx(
        'DonutChart',
        { ...p, legend: legend === 'none' ? '' : legend },
        { size: 200, thickness: 22, maxSlices: 6, tableView: false, legend: 'side' },
        undefined,
        [...(legend === 'none' ? ['legend={false}'] : []), 'aria-label="Revenue by channel"', 'data={slices}'],
      ),
  },
  examples: [
    {
      id: 'channels',
      title: 'With a value list',
      description: 'Each row shows value and share; hovering a row highlights its slice.',
      Component: Channels,
    },
    {
      id: 'compact',
      title: 'Compact, custom centre',
      description: 'A slice can take its own colour, like the empty part of a storage meter.',
      Component: Compact,
    },
  ],
  a11y: [
    'Screen readers get a table of parts, values and shares.',
    'The list beside the ring repeats every label and value, so colour is never the only key.',
  ],
  props: [
    { name: 'data', type: '{ label, value, color? }[]', description: 'Slices.' },
    { name: 'aria-label', type: 'string', description: 'What the chart shows.' },
    { name: 'size / thickness', type: 'number', defaultValue: '200 / 22', description: 'Ring size in px.' },
    { name: 'centerLabel / centerCaption', type: 'ReactNode', defaultValue: "total / 'Total'", description: 'Text in the middle.' },
    { name: 'legend', type: "'side' | 'bottom' | false", defaultValue: "'side'", description: 'Value list placement.' },
    { name: 'maxSlices', type: 'number', defaultValue: '6', description: 'Fold the rest into “Other”.' },
    { name: 'valueFormat / loading / empty / tableView', type: '…', description: 'As on the other charts.' },
  ],
});
