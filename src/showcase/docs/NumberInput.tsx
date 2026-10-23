import { useState } from 'react';
import { Field, NumberInput } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './NumberInput.tsx?raw';

// #region basic
export function Basic() {
  const [qty, setQty] = useState<number | null>(2);
  const [price, setPrice] = useState<number | null>(49.5);
  return (
    <div className="ex-col">
      <Field label="Quantity" hint="1 – 20">
        <NumberInput value={qty} onChange={setQty} min={1} max={20} />
      </Field>
      <Field label="Unit price">
        <NumberInput value={price} onChange={setPrice} min={0} step={0.5} precision={2} prefix="$" stepper={false} />
      </Field>
      <Field label="Discount">
        <NumberInput defaultValue={10} min={0} max={100} step={5} suffix="%" />
      </Field>
      <span className="muted">Total: ${((qty ?? 0) * (price ?? 0)).toFixed(2)}</span>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'NumberInput',
  group: 'Form inputs',
  status: 'new',
  description: 'Numeric field with − / + buttons, keyboard stepping, limits, decimals and currency or unit affixes.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'min', default: 0, min: -100, max: 0 },
      { type: 'number', name: 'max', default: 100, min: 10, max: 1000, step: 10 },
      { type: 'number', name: 'step', default: 1, min: 1, max: 25 },
      { type: 'number', name: 'precision', default: 0, min: 0, max: 3 },
      { type: 'text', name: 'prefix', default: '' },
      { type: 'text', name: 'suffix', default: '' },
      { type: 'boolean', name: 'stepper', default: true },
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(220px, 100%)' }}>
        <NumberInput
          aria-label="Playground number"
          defaultValue={12}
          min={Number(v.min)}
          max={Number(v.max)}
          step={Number(v.step)}
          precision={Number(v.precision)}
          prefix={String(v.prefix) || undefined}
          suffix={String(v.suffix) || undefined}
          stepper={!!v.stepper}
          size={v.size as 'md'}
          disabled={!!v.disabled}
        />
      </div>
    ),
    code: (p) =>
      jsx(
        'NumberInput',
        p,
        { min: 0, max: 100, step: 1, precision: 0, prefix: '', suffix: '', stepper: true, size: 'md', disabled: false },
        undefined,
        ['value={value}', 'onChange={setValue}'],
      ),
  },
  examples: [
    {
      id: 'basic',
      title: 'Quantity, price and percent',
      description: 'Use ↑ ↓ to step (Shift for ×10). Out-of-range values are clamped when you leave the field.',
      Component: Basic,
    },
  ],
  keyboard: [
    ['↑ + ↓', 'Step up or down'],
    ['Shift + ↑', 'Step ×10 (also Page Up / Page Down)'],
    ['Home + End', 'Minimum or maximum'],
    ['Enter', 'Apply what you typed'],
  ],
  a11y: [
    'Uses role="spinbutton" with aria-valuenow, -min and -max.',
    'The − / + buttons are skipped by Tab (the keys do the same thing) but are labelled for pointer and screen-reader users.',
  ],
  props: [
    { name: 'value / defaultValue', type: 'number | null', description: 'Controlled or starting value; null is empty.' },
    { name: 'onChange', type: '(v: number | null) => void', description: 'Called with the number.' },
    { name: 'min / max / step', type: 'number', defaultValue: '−∞ / ∞ / 1', description: 'Limits and step.' },
    { name: 'precision', type: 'number', description: 'Decimal places.' },
    { name: 'prefix / suffix', type: 'ReactNode', description: 'E.g. "$" or "%".' },
    { name: 'stepper', type: 'boolean', defaultValue: 'true', description: 'Show − / + buttons.' },
  ],
});
