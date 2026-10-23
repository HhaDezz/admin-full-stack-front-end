import { useState } from 'react';
import { Gauge } from '@/components/charts';
import { Slider } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Gauge.tsx?raw';

// #region bands
export function Bands() {
  const [cpu, setCpu] = useState(64);
  return (
    <div className="ex-col" style={{ alignItems: 'center' }}>
      <Gauge
        label="CPU load"
        value={cpu}
        valueFormat={(n) => `${Math.round(n)}%`}
        caption="CPU load"
        bands={[
          { from: 0, tone: 'success' },
          { from: 70, tone: 'warning' },
          { from: 90, tone: 'danger' },
        ]}
      />
      <div style={{ width: 220 }}>
        <Slider aria-label="Try a value" value={cpu} onChange={setCpu} />
      </div>
    </div>
  );
}
// #endregion

// #region goal
export function Goal() {
  return (
    <Gauge
      label="Quarterly target"
      value={184_000}
      max={250_000}
      valueFormat={(n) => `$${Math.round(n / 1000)}K`}
      caption="of $250K target"
      size={200}
    />
  );
}
// #endregion

export default defineDoc({
  name: 'Gauge',
  group: 'Charts',
  status: 'new',
  importFrom: '@/components/charts',
  description:
    'One number against its range: server load, quota used, progress to a target. Colour bands switch the fill from good to warning to critical. Pure SVG, no chart library.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'value', default: 72, min: 0, max: 100 },
      { type: 'boolean', name: 'bands', default: true },
      { type: 'number', name: 'size', default: 220, min: 140, max: 300, step: 20 },
      { type: 'boolean', name: 'showRange', default: true },
    ],
    render: (v) => (
      <Gauge
        label="Playground gauge"
        value={Number(v.value)}
        size={Number(v.size)}
        showRange={!!v.showRange}
        valueFormat={(n) => `${Math.round(n)}%`}
        caption="used"
        bands={
          v.bands
            ? [
                { from: 0, tone: 'success' },
                { from: 70, tone: 'warning' },
                { from: 90, tone: 'danger' },
              ]
            : undefined
        }
      />
    ),
    code: ({ bands, ...p }) =>
      jsx('Gauge', p, { size: 220, showRange: true }, undefined, [
        'label="Disk used"',
        ...(bands ? ["bands={[{ from: 0, tone: 'success' }, { from: 70, tone: 'warning' }, { from: 90, tone: 'danger' }]}"] : []),
      ]),
  },
  examples: [
    {
      id: 'bands',
      title: 'Colour bands',
      description: 'Move the slider: the fill and its track change colour at 70 and 90.',
      Component: Bands,
    },
    { id: 'goal', title: 'Progress to a target', description: 'Any range and format.', Component: Goal },
  ],
  a11y: [
    'role="meter" with aria-valuenow, min, max and a spoken value.',
    'The colour is backed by the number in the middle, so the state never depends on colour alone.',
  ],
  props: [
    { name: 'value / min / max', type: 'number', defaultValue: '– / 0 / 100', description: 'The reading and its range.' },
    { name: 'label', type: 'string', description: 'Accessible name.' },
    { name: 'caption', type: 'ReactNode', description: 'Text under the number.' },
    { name: 'bands', type: "{ from, tone: 'brand' | 'success' | 'warning' | 'danger' }[]", description: 'Colour by range.' },
    { name: 'valueFormat', type: '(n) => string', description: 'How the number is written.' },
    { name: 'size / showRange', type: 'number / boolean', defaultValue: '220 / true', description: 'Width; min and max under the ends.' },
  ],
});
