import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Field, Select } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Select.tsx?raw';

const SIZES = [
  { value: 'xs', label: 'Extra small' },
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra large', disabled: true },
];

// #region field
export function InField() {
  const [size, setSize] = useState('');
  return (
    <div style={{ width: 'min(320px, 100%)' }}>
      <Field label="Size" required hint={size ? `You picked ${size.toUpperCase()}.` : 'Extra large is sold out.'}>
        <Select options={SIZES} value={size} onChange={setSize} placeholder="Choose a size" />
      </Field>
    </div>
  );
}
// #endregion

// #region groups
const ZONES = [
  {
    label: 'Europe',
    options: [
      { value: 'Europe/London', label: 'London (GMT+0)' },
      { value: 'Europe/Berlin', label: 'Berlin (GMT+1)' },
    ],
  },
  {
    label: 'Asia',
    options: [
      { value: 'Asia/Colombo', label: 'Colombo (GMT+5:30)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
    ],
  },
];

export function Groups() {
  return (
    <div style={{ width: 'min(320px, 100%)' }}>
      <Field label="Time zone">
        <Select options={ZONES} defaultValue="Asia/Colombo" prefix={<Globe size={15} />} />
      </Field>
    </div>
  );
}
// #endregion

// #region sizes
export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Select
          key={s}
          size={s}
          aria-label={`Rows per page (${s})`}
          options={['10', '25', '50'].map((v) => ({ value: v, label: `${v} rows` }))}
          defaultValue="25"
        />
      ))}
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Select',
  group: 'Form inputs',
  status: 'new',
  description:
    'The browser’s own dropdown, styled to match the other inputs. Best for short fixed lists and on phones, where it opens the system picker; use SearchSelect when people need to search or pick several.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'text', name: 'placeholder', default: 'Choose a size' },
      { type: 'boolean', name: 'disabled', default: false },
      { type: 'boolean', name: 'invalid', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(280px, 100%)' }}>
        <Select
          aria-label="Size"
          options={SIZES}
          size={v.size as 'md'}
          placeholder={String(v.placeholder)}
          disabled={!!v.disabled}
          invalid={!!v.invalid}
        />
      </div>
    ),
    code: (p) =>
      jsx('Select', p, { size: 'md', placeholder: '', disabled: false, invalid: false }, undefined, [
        'options={sizes}',
        'value={size}',
        'onChange={setSize}',
      ]),
  },
  examples: [
    {
      id: 'field',
      title: 'In a Field',
      description: 'Label, hint, required mark and errors come from Field. A disabled option stays visible but can’t be picked.',
      Component: InField,
    },
    {
      id: 'groups',
      title: 'Groups and an icon',
      description: 'Pass { label, options } to group choices under a heading (an optgroup).',
      Component: Groups,
    },
    { id: 'sizes', title: 'Sizes', description: 'sm, md and lg line up with Input and Button of the same size.', Component: Sizes },
  ],
  keyboard: [
    ['Space / Alt+Down', 'Open the list'],
    ['Up / Down', 'Change the choice'],
    ['Letters', 'Jump to the first choice starting with them'],
  ],
  a11y: [
    'A real <select>, so every browser, screen reader and phone handles it natively.',
    'Inside a Field it gets its label, hint and error through id and aria-describedby, and aria-invalid when there is an error.',
    'The placeholder is an empty first option; it can’t be picked again when the field is required.',
  ],
  props: [
    { name: 'options', type: '(SelectItem | SelectItemGroup)[]', description: '{ value, label, disabled? } or { label, options }.' },
    { name: 'value / defaultValue / onChange', type: 'string', description: 'The picked value.' },
    { name: 'placeholder', type: 'string', description: 'Empty first choice.' },
    { name: 'prefix', type: 'ReactNode', description: 'Icon before the value.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Height.' },
    { name: 'disabled / invalid / required', type: 'boolean', description: 'Also read from a surrounding Field.' },
    { name: 'name / id / aria-label / onBlur', type: '…', description: 'Passed to the <select>.' },
  ],
});
