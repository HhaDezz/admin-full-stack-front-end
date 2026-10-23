import { FunnelChart } from '@/components/charts';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './FunnelChart.tsx?raw';

// #region signup
export function Signup() {
  return (
    <div style={{ width: 'min(560px, 100%)' }}>
      <FunnelChart
        aria-label="Sign-up funnel, last 30 days"
        steps={[
          { label: 'Visited pricing', value: 12840 },
          { label: 'Started sign-up', value: 4210 },
          { label: 'Confirmed email', value: 3380 },
          { label: 'Invited a teammate', value: 1460 },
          { label: 'Upgraded', value: 512 },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'FunnelChart',
  group: 'Charts',
  status: 'new',
  importFrom: '@/components/charts',
  description:
    'How many people make it through each step of a flow, with the share of the start and the drop between steps. Plain HTML bars that grow in on load.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'showDropOff', default: true },
      { type: 'select', name: 'color', options: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-4)'], default: 'var(--chart-1)' },
    ],
    render: (v) => (
      <div style={{ width: 'min(520px, 100%)' }}>
        <FunnelChart
          aria-label="Playground funnel"
          showDropOff={!!v.showDropOff}
          color={String(v.color)}
          steps={[
            { label: 'Cart', value: 3200 },
            { label: 'Checkout', value: 1840 },
            { label: 'Paid', value: 1290 },
          ]}
        />
      </div>
    ),
    code: (p) =>
      jsx('FunnelChart', p, { showDropOff: true, color: 'var(--chart-1)' }, undefined, ['aria-label="Checkout"', 'steps={steps}']),
  },
  examples: [
    {
      id: 'signup',
      title: 'Sign-up funnel',
      description: 'Each row: count, share of everyone who started, and what happened since the step before.',
      Component: Signup,
    },
  ],
  a11y: ['An ordered list of steps; every number is written out, so nothing depends on the bars.'],
  props: [
    { name: 'steps', type: '{ label, value }[]', description: 'Steps in order.' },
    { name: 'aria-label', type: 'string', description: 'What the funnel measures.' },
    { name: 'valueFormat', type: '(n) => string', description: 'How counts are written.' },
    { name: 'showDropOff', type: 'boolean', defaultValue: 'true', description: 'Line under each step.' },
    { name: 'color', type: 'string', defaultValue: "'var(--chart-1)'", description: 'Bar colour.' },
  ],
});
