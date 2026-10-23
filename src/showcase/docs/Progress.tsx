import { useEffect, useState } from 'react';
import { Progress, ProgressRing } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Progress.tsx?raw';

// #region bars
export function Bars() {
  const [v, setV] = useState(20);
  useEffect(() => {
    const t = setInterval(() => setV((x) => (x >= 100 ? 10 : x + 15)), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="ex-col">
      <Progress label="Uploading patterns.zip" value={v} showValue />
      <Progress label="Storage" value={82} tone="warning" size="sm" showValue />
      <Progress label="Importing customers" />
    </div>
  );
}
// #endregion

// #region rings
export function Rings() {
  return (
    <div className="ex-row">
      <ProgressRing value={72} aria-label="Profile complete" />
      <ProgressRing value={45} size={96} thickness={9} tone="warning" aria-label="Quota used" />
      <ProgressRing value={3} max={4} size={64} tone="success" aria-label="Steps done">
        3/4
      </ProgressRing>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Progress',
  group: 'Feedback',
  status: 'new',
  imports: ['Progress', 'ProgressRing'],
  description: 'Bars and rings for uploads, quotas and completion, plus an indeterminate bar when the end isn’t known.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'value', default: 64, min: 0, max: 100 },
      { type: 'select', name: 'tone', options: ['brand', 'info', 'success', 'warning', 'danger', 'neutral'], default: 'brand' },
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'text', name: 'label', default: 'Uploading' },
      { type: 'boolean', name: 'showValue', default: true },
    ],
    render: (v) => (
      <div style={{ width: 'min(420px, 100%)' }}>
        <Progress
          value={Number(v.value)}
          tone={v.tone as 'brand'}
          size={v.size as 'md'}
          label={String(v.label)}
          showValue={!!v.showValue}
        />
      </div>
    ),
    code: (p) => jsx('Progress', p, { tone: 'brand', size: 'md', showValue: false }),
  },
  examples: [
    { id: 'bars', title: 'Bars', description: 'Determinate (animated), a warning tone, and indeterminate (no value).', Component: Bars },
    { id: 'rings', title: 'Rings', description: 'Custom size, thickness and centre content.', Component: Rings },
  ],
  a11y: ['role="progressbar" with aria-valuenow / -min / -max (left out when indeterminate) and a name.'],
  props: [
    { name: 'value / max', type: 'number', defaultValue: '— / 100', description: 'Leave value out for indeterminate (bar only).' },
    { name: 'label / showValue', type: 'ReactNode / boolean', description: 'Bar: text and percentage above.' },
    { name: 'tone', type: 'Tone', defaultValue: "'brand'", description: 'Colour.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Bar thickness.' },
    { name: 'size / thickness / children', type: 'number / number / ReactNode', defaultValue: '72 / 7 / %', description: 'Ring options.' },
  ],
});
