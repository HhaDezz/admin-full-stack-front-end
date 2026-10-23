import { Sparkline } from '@/components/charts';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Sparkline.tsx?raw';

// #region inline
const WEEK = [12, 18, 15, 22, 19, 26, 31];
const DOWN = [31, 29, 30, 24, 22, 19, 17];

export function Inline() {
  return (
    <div className="ex-col">
      <div className="ex-row">
        <span style={{ width: 120 }}>Orders</span>
        <Sparkline data={WEEK} aria-label="Orders, last 7 days: rising from 12 to 31" />
        <b>31</b>
      </div>
      <div className="ex-row">
        <span style={{ width: 120 }}>Refund requests</span>
        <Sparkline data={DOWN} tone="danger" aria-label="Refund requests, last 7 days: falling from 31 to 17" />
        <b>17</b>
      </div>
      <div className="ex-row">
        <span style={{ width: 120 }}>Line only</span>
        <Sparkline data={WEEK} area={false} tone="info" width={140} />
      </div>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Sparkline',
  group: 'Charts',
  status: 'new',
  importFrom: '@/components/charts',
  description:
    'A word-sized trend line for tables, stat cards and lists. Plain SVG, no chart library, so it’s cheap enough to draw on every row.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'tone', options: ['brand', 'info', 'success', 'danger'], default: 'brand' },
      { type: 'boolean', name: 'area', default: true },
      { type: 'number', name: 'width', default: 96, min: 48, max: 240, step: 8 },
      { type: 'number', name: 'height', default: 32, min: 16, max: 64, step: 4 },
    ],
    render: (v) => (
      <Sparkline
        data={WEEK}
        tone={String(v.tone)}
        area={!!v.area}
        width={Number(v.width)}
        height={Number(v.height)}
        aria-label="Playground trend"
      />
    ),
    code: (p) =>
      jsx('Sparkline', p, { tone: 'brand', area: true, width: 96, height: 32 }, undefined, [
        'data={week}',
        'aria-label="Orders, last 7 days"',
      ]),
  },
  examples: [
    {
      id: 'inline',
      title: 'Beside a number',
      description: 'Give it an aria-label that says the trend in words; without one it’s decorative.',
      Component: Inline,
    },
  ],
  a11y: ['With aria-label it’s an image whose name should state the trend; without one it’s hidden from screen readers.'],
  props: [
    { name: 'data', type: 'number[]', description: 'Points, oldest first.' },
    { name: 'tone', type: 'string', defaultValue: "'brand'", description: 'Any tone class: brand, info, success, warning, danger.' },
    { name: 'area', type: 'boolean', defaultValue: 'true', description: 'Soft fill under the line.' },
    { name: 'width / height', type: 'number', defaultValue: '96 / 32', description: 'Size in px.' },
    { name: 'aria-label', type: 'string', description: 'The trend in words.' },
  ],
});
