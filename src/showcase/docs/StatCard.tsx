import { useState } from 'react';
import { AlertTriangle, DollarSign, UserPlus, Users } from 'lucide-react';
import { Button, Grid, Sparkline, StatCard } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './StatCard.tsx?raw';

// #region kpis
export function Kpis() {
  return (
    <Grid minChildWidth={220} gap={4}>
      <StatCard label="Active users" value={4821} icon={<Users size={18} />} delta={12.4} trend={[32, 34, 33, 38, 41, 40, 46, 49]} />
      <StatCard
        label="Revenue"
        value={128450}
        format={(n) => `$${Math.round(n).toLocaleString()}`}
        icon={<DollarSign size={18} />}
        tone="gold"
        delta={4.1}
        trend={[20, 22, 21, 25, 24, 27, 29, 30]}
      />
      <StatCard
        label="Sign-ups"
        value={318}
        icon={<UserPlus size={18} />}
        tone="blue"
        delta={-6.2}
        trend={[40, 38, 41, 36, 35, 33, 31, 30]}
      />
      <StatCard
        label="Failed sign-ins"
        value={27}
        icon={<AlertTriangle size={18} />}
        tone="red"
        delta={-18}
        invertDelta
        deltaLabel="vs last week"
      />
    </Grid>
  );
}
// #endregion

// #region loading
export function Loading() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="ex-col">
      <StatCard
        label="Orders today"
        value={1294}
        loading={loading}
        delta={8.3}
        trend={[3, 5, 4, 6, 8, 7, 9]}
        footnote="Updated a minute ago"
      />
      <Button onClick={() => setLoading((l) => !l)}>{loading ? 'Finish loading' : 'Load again'}</Button>
    </div>
  );
}
// #endregion

// #region sparkline
export function SparklineOnly() {
  return (
    <div className="ex-row">
      <Sparkline data={[4, 6, 5, 8, 7, 9, 12]} width={120} height={36} aria-label="Weekly visits, rising" />
      <Sparkline data={[12, 10, 11, 8, 7, 6, 4]} width={120} height={36} tone="danger" area={false} aria-label="Weekly errors, falling" />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'StatCard',
  group: 'Data display',
  status: 'new',
  imports: ['StatCard', 'Sparkline'],
  description: 'A KPI tile: the number counts up on load, with a coloured change and a sparkline drawn in plain SVG (no chart library).',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'label', default: 'Revenue' },
      { type: 'number', name: 'value', default: 48200, min: 0, max: 100000, step: 100 },
      { type: 'number', name: 'delta', default: 12, min: -50, max: 50 },
      { type: 'select', name: 'tone', options: ['green', 'gold', 'terra', 'red', 'blue'], default: 'green' },
      { type: 'boolean', name: 'trend', default: true },
      { type: 'boolean', name: 'invertDelta', default: false },
      { type: 'boolean', name: 'loading', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(280px, 100%)' }}>
        <StatCard
          label={String(v.label)}
          value={Number(v.value)}
          format={(n) => `$${Math.round(n).toLocaleString()}`}
          icon={<DollarSign size={20} />}
          tone={v.tone as 'green'}
          delta={Number(v.delta)}
          deltaLabel="vs last month"
          invertDelta={!!v.invertDelta}
          trend={v.trend ? [12, 18, 15, 22, 19, 26, 31] : undefined}
          loading={!!v.loading}
        />
      </div>
    ),
    code: ({ trend, ...p }) =>
      jsx('StatCard', p, { tone: 'green', invertDelta: false, loading: false }, undefined, [
        'icon={<DollarSign size={20} />}',
        ...(trend ? ['trend={weekly}'] : []),
      ]),
  },
  examples: [
    {
      id: 'kpis',
      title: 'KPI row',
      description: 'invertDelta flips the colour for numbers where down is good, like errors.',
      Component: Kpis,
    },
    {
      id: 'loading',
      title: 'Loading',
      description: 'A skeleton holds the space; the count-up starts when data arrives.',
      Component: Loading,
    },
    {
      id: 'sparkline',
      title: 'Sparkline on its own',
      description: 'Give it an aria-label when it carries meaning; otherwise it is hidden from screen readers.',
      Component: SparklineOnly,
    },
  ],
  a11y: [
    'The number is announced once at its final value (aria-label), not at every frame of the count-up.',
    'The change shows an arrow icon and a sign, so colour is never the only signal.',
    'The count-up is skipped when reduced motion is on.',
  ],
  props: [
    { name: 'label', type: 'ReactNode', description: 'What the number measures.' },
    { name: 'value', type: 'number', description: 'The number.' },
    { name: 'format', type: '(n: number) => string', description: 'Currency, percent, units.' },
    { name: 'tone', type: "'green' | 'gold' | 'terra' | 'red' | 'blue'", defaultValue: "'green'", description: 'Icon tint.' },
    { name: 'delta', type: 'number', description: 'Change in %, shown with an arrow.' },
    { name: 'invertDelta', type: 'boolean', defaultValue: 'false', description: 'Lower is better.' },
    { name: 'trend', type: 'number[]', description: 'Values for the sparkline.' },
    { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Skeleton in place of the number.' },
  ],
});
