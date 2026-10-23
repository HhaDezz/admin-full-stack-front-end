import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Field, Rating } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Rating.tsx?raw';

// #region input
export function Input() {
  const [v, setV] = useState(4);
  return (
    <div className="ex-col" style={{ alignItems: 'flex-start' }}>
      <Field label="How was the fit?">
        <Rating value={v} onChange={setV} labels={['Poor', 'Fair', 'Good', 'Great', 'Excellent']} showLabel />
      </Field>
    </div>
  );
}
// #endregion

// #region display
export function Display() {
  return (
    <div className="ex-col" style={{ alignItems: 'flex-start' }}>
      <div className="ex-row">
        <Rating readOnly value={4.3} size={18} aria-label="Average rating" />
        <span className="muted">4.3 from 128 reviews</span>
      </div>
      <Rating aria-label="Favourite" defaultValue={3} icon={<Heart />} size={20} />
      <Rating aria-label="Disabled rating" defaultValue={2} disabled />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Rating',
  group: 'Form inputs',
  status: 'new',
  description:
    'Stars (or any icon) to give a score, or to show an average with fractions. Labels for each value and full keyboard support.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'max', default: 5, min: 3, max: 10 },
      { type: 'number', name: 'size', default: 22, min: 14, max: 40, step: 2 },
      { type: 'boolean', name: 'readOnly', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <Rating
        key={String(v.readOnly)}
        aria-label="Playground rating"
        max={Number(v.max)}
        size={Number(v.size)}
        readOnly={!!v.readOnly}
        disabled={!!v.disabled}
        defaultValue={v.readOnly ? 3.6 : 3}
        value={v.readOnly ? 3.6 : undefined}
      />
    ),
    code: (p) =>
      jsx('Rating', p, { max: 5, size: 22, readOnly: false, disabled: false }, undefined, ['value={value}', 'onChange={setValue}']),
  },
  examples: [
    {
      id: 'input',
      title: 'As an input',
      description: 'labels gives each value a word, read out and shown beside the stars.',
      Component: Input,
    },
    { id: 'display', title: 'Read-only, custom icon, disabled', description: 'readOnly shows fractions such as 4.3.', Component: Display },
  ],
  keyboard: [
    ['Tab', 'Into the rating (to the chosen star)'],
    ['Arrow keys', 'Choose the next or previous value'],
    ['Space', 'Choose the focused star'],
  ],
  a11y: [
    'Inputs are native radio buttons in a radiogroup, each named by its label (“Good”) or “3 stars”. Clicking the chosen star again clears it.',
    'Read-only ratings are an image with a label like “4.3 out of 5”.',
  ],
  props: [
    { name: 'value / defaultValue', type: 'number', description: 'The score.' },
    { name: 'onChange', type: '(v: number) => void', description: 'New score.' },
    { name: 'max', type: 'number', defaultValue: '5', description: 'Number of icons.' },
    { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: 'Display only, with fractions.' },
    { name: 'labels / showLabel', type: 'string[] / boolean', description: 'Words for each value.' },
    { name: 'icon', type: 'ReactNode', defaultValue: 'Star', description: 'Any lucide icon.' },
    { name: 'size', type: 'number', defaultValue: '22', description: 'Icon size in px.' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disable.' },
  ],
});
