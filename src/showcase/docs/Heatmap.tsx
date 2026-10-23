import { Heatmap } from '@/components/charts';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Heatmap.tsx?raw';

// #region hours
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
const SIGNINS = DAYS.map((_, d) =>
  HOURS.map((_, h) => {
    const work = h >= 8 && h <= 18 ? 1 : 0.15;
    const weekend = d >= 5 ? 0.35 : 1;
    return Math.round(40 * work * weekend * (1 + Math.sin((h - 6) / 3.5)) + ((d * 7 + h) % 5));
  }),
);

export function Hours() {
  return (
    <div className="ex-chart">
      <Heatmap
        aria-label="Sign-ins by weekday and hour"
        rows={DAYS}
        columns={HOURS}
        values={SIGNINS}
        columnLabelEvery={3}
        valueFormat={(n) => `${n} sign-ins`}
      />
    </div>
  );
}
// #endregion

// #region cohorts
const COHORTS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const RETENTION = COHORTS.map((_, r) =>
  [1, 2, 3, 4, 5, 6].map((m) => (m > COHORTS.length - r ? null : Math.round(100 * Math.pow(0.78 + r * 0.01, m)))),
);

export function Cohorts() {
  return (
    <div className="ex-chart">
      <Heatmap
        aria-label="Customers still active by sign-up month"
        rows={COHORTS}
        columns={['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']}
        values={RETENTION}
        cellHeight={34}
        valueFormat={(n) => `${n}% retained`}
        scaleLabels={['Lower', 'Higher']}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Heatmap',
  group: 'Charts',
  status: 'new',
  importFrom: '@/components/charts',
  description:
    'A grid where a darker cell means more: busy hours, activity by weekday, cohort retention. One colour from light to dark, a scale under the grid, and a table underneath for screen readers.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'cellHeight', default: 28, min: 16, max: 40, step: 2 },
      { type: 'number', name: 'columnLabelEvery', default: 3, min: 1, max: 6 },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <Heatmap
          aria-label="Playground heatmap"
          rows={DAYS}
          columns={HOURS}
          values={SIGNINS}
          cellHeight={Number(v.cellHeight)}
          columnLabelEvery={Number(v.columnLabelEvery)}
        />
      </div>
    ),
    code: (p) =>
      jsx('Heatmap', p, { cellHeight: 28, columnLabelEvery: 1 }, undefined, [
        'aria-label="Sign-ins by hour"',
        'rows={days}',
        'columns={hours}',
        'values={counts}',
      ]),
  },
  examples: [
    { id: 'hours', title: 'Busy hours', description: 'Every third hour is labelled; hover a cell for its value.', Component: Hours },
    {
      id: 'cohorts',
      title: 'Cohort retention',
      description: 'null leaves a cell empty (months that haven’t happened yet).',
      Component: Cohorts,
    },
  ],
  a11y: [
    'Built as a real table: every cell carries its value as text for screen readers, with row and column headers.',
    'Uses one hue from light to dark, which also reads in greyscale.',
  ],
  props: [
    { name: 'rows / columns', type: 'string[]', description: 'Labels.' },
    { name: 'values', type: '(number | null)[][]', description: 'values[row][column].' },
    { name: 'aria-label', type: 'string', description: 'What the grid shows.' },
    { name: 'valueFormat', type: '(n) => string', description: 'Tooltip and screen-reader text.' },
    { name: 'columnLabelEvery', type: 'number', defaultValue: '1', description: 'Label every nth column.' },
    { name: 'cellHeight', type: 'number', defaultValue: '28', description: 'Cell height in px.' },
    { name: 'scaleLabels', type: '[ReactNode, ReactNode]', defaultValue: "['Less', 'More']", description: 'Ends of the scale.' },
  ],
});
