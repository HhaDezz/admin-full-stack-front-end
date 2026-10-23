import { useState } from 'react';
import { Field, Slider } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Slider.tsx?raw';

// #region single
export function Single() {
  const [volume, setVolume] = useState(40);
  return (
    <div className="ex-col">
      <Field label="Volume" hint={`${volume}%`}>
        <Slider value={volume} onChange={setVolume} formatValue={(v) => `${v}%`} />
      </Field>
    </div>
  );
}
// #endregion

// #region range
export function Range() {
  const [price, setPrice] = useState<[number, number]>([120, 640]);
  return (
    <div className="ex-col">
      <Field label="Price" hint={`$${price[0]} – $${price[1]}`}>
        <Slider aria-label="Price" min={0} max={1000} step={10} value={price} onChange={setPrice} formatValue={(v) => `$${v}`} />
      </Field>
    </div>
  );
}
// #endregion

// #region marks
export function Marks() {
  return (
    <div className="ex-col">
      <Slider
        aria-label="Session timeout"
        min={5}
        max={60}
        step={5}
        defaultValue={30}
        marks={[
          { value: 5, label: '5 min' },
          { value: 15, label: '15' },
          { value: 30, label: '30' },
          { value: 60, label: '1 hour' },
        ]}
        formatValue={(v) => `${v} min`}
      />
      <Slider aria-label="Rating" min={1} max={5} defaultValue={4} marks tone="accent" />
      <Slider aria-label="Disabled" defaultValue={60} disabled />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Slider',
  group: 'Form inputs',
  status: 'new',
  description: 'Pick a number or a range by dragging or with the keyboard. Marks, labels, value bubbles and right-to-left support.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'step', default: 5, min: 1, max: 25 },
      { type: 'select', name: 'tone', options: ['brand', 'accent', 'danger'], default: 'brand' },
      { type: 'boolean', name: 'range', default: false },
      { type: 'boolean', name: 'marks', default: false },
      { type: 'boolean', name: 'showValue', default: true },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(420px, 100%)' }}>
        <Slider
          key={`${v.range}-${v.step}`}
          aria-label="Playground"
          step={Number(v.step)}
          tone={v.tone as 'brand'}
          marks={!!v.marks}
          showValue={!!v.showValue}
          disabled={!!v.disabled}
          defaultValue={(v.range ? [20, 70] : 40) as number}
        />
      </div>
    ),
    code: ({ range, ...p }) =>
      jsx('Slider', p, { step: 1, tone: 'brand', marks: false, showValue: true, disabled: false }, undefined, [
        range ? 'value={range} // [20, 70]' : 'value={value}',
        'onChange={setValue}',
      ]),
  },
  examples: [
    { id: 'single', title: 'Single value', description: 'Inside a Field it takes the field’s label and hint.', Component: Single },
    { id: 'range', title: 'Range', description: 'Two thumbs that can’t cross. Clicking the track moves the nearer one.', Component: Range },
    { id: 'marks', title: 'Marks, tones and disabled', description: 'marks={true} puts a dot on every step.', Component: Marks },
  ],
  keyboard: [
    ['Right', 'Increase by one step (decrease in right-to-left)'],
    ['Left', 'Decrease by one step'],
    ['Up', 'Increase by one step'],
    ['Down', 'Decrease by one step'],
    ['PageUp', 'Increase by a tenth of the range'],
    ['PageDown', 'Decrease by a tenth of the range'],
    ['Home', 'Minimum'],
    ['End', 'Maximum'],
  ],
  a11y: [
    'Each thumb has role="slider" with aria-valuenow, aria-valuetext (your formatValue) and min/max limits that follow the other thumb in a range.',
    'Range thumbs are named “<label> Minimum” and “<label> Maximum”; change the words with thumbLabels.',
  ],
  props: [
    { name: 'value / defaultValue', type: 'number | [number, number]', description: 'A pair makes it a range.' },
    { name: 'onChange', type: '(v) => void', description: 'Every move.' },
    { name: 'onChangeEnd', type: '(v) => void', description: 'Once, when the user lets go or presses a key.' },
    { name: 'min / max / step', type: 'number', defaultValue: '0 / 100 / 1', description: 'Limits and step.' },
    { name: 'pageStep', type: 'number', description: 'Page Up / Page Down step.' },
    { name: 'marks', type: 'boolean | { value, label? }[]', description: 'Dots on the track, optional labels below.' },
    { name: 'showValue', type: 'boolean', defaultValue: 'true', description: 'Bubble above the thumb while dragging or focused.' },
    { name: 'formatValue', type: '(v: number) => string', description: 'Text for the bubble and screen readers.' },
    { name: 'tone', type: "'brand' | 'accent' | 'danger'", defaultValue: "'brand'", description: 'Colour.' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disable.' },
  ],
});
