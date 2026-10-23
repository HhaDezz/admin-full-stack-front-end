import { useState } from 'react';
import { Button, Steps } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Steps.tsx?raw';

const steps = [
  { title: 'Account', description: 'Email and password' },
  { title: 'Company', description: 'Name and size' },
  { title: 'Team', description: 'Invite people' },
  { title: 'Done', description: 'Start working' },
];

// #region horizontal
export function Horizontal() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="ex-wide" style={{ display: 'grid', gap: 20 }}>
      <Steps items={steps} current={current} onStepClick={setCurrent} />
      <div className="ex-row">
        <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Back
        </Button>
        <Button variant="primary" disabled={current === steps.length - 1} onClick={() => setCurrent(current + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
// #endregion

// #region vertical
export function Vertical() {
  return (
    <Steps
      orientation="vertical"
      current={2}
      items={[
        { title: 'Order placed', description: '12 Oct, 09:14' },
        { title: 'Payment confirmed', description: '12 Oct, 09:15' },
        { title: 'Being made', description: 'Cutting and stitching' },
        { title: 'Shipped' },
      ]}
    />
  );
}
// #endregion

export default defineDoc({
  name: 'Steps',
  group: 'Navigation',
  status: 'new',
  description: 'Progress through a multi-step flow, across or down. Completed steps can be clickable to go back.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'current', default: 1, min: 0, max: 3 },
      { type: 'select', name: 'orientation', options: ['horizontal', 'vertical'], default: 'horizontal' },
      { type: 'boolean', name: 'descriptions', default: true },
      { type: 'boolean', name: 'error', label: 'error on step 2', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <Steps
          current={Number(v.current)}
          orientation={v.orientation as 'horizontal'}
          items={['Account', 'Team', 'Billing', 'Done'].map((t, i) => ({
            title: t,
            description: v.descriptions ? ['Your details', 'Invite people', 'Pick a plan', 'All set'][i] : undefined,
            error: !!v.error && i === 1,
          }))}
        />
      </div>
    ),
    code: ({ descriptions: _d, error: _e, ...p }) => jsx('Steps', p, { orientation: 'horizontal' }, undefined, ['items={steps}']),
  },
  examples: [
    {
      id: 'horizontal',
      title: 'Wizard',
      description: 'Click a completed step to return to it. On phones only the current step’s title shows.',
      Component: Horizontal,
    },
    { id: 'vertical', title: 'Vertical timeline', description: 'For order tracking or onboarding checklists.', Component: Vertical },
  ],
  a11y: ['An ordered list; the current step has aria-current="step" and each step’s state (“completed”, “current step”) is read out.'],
  props: [
    { name: 'items', type: 'StepItem[]', description: '{ title, description?, error? }' },
    { name: 'current', type: 'number', description: 'Index of the current step.' },
    { name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: "'horizontal'", description: 'Layout.' },
    { name: 'onStepClick', type: '(index) => void', description: 'Make completed steps clickable.' },
  ],
});
