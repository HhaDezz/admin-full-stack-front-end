import { useState } from 'react';
import { Checkbox } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx, type PlaygroundValues } from '../Playground';
import raw from './Checkbox.tsx?raw';

// #region basic
export function Basic() {
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(true);
  return (
    <div className="ex-col">
      <Checkbox checked={terms} onChange={setTerms} label="I agree to the terms" />
      <Checkbox checked={news} onChange={setNews} label="Product news" description="One email a month, no spam." />
      <Checkbox checked={false} onChange={() => {}} label="Disabled" disabled />
    </div>
  );
}
// #endregion

// #region parent
export function Parent() {
  const all = ['Read', 'Create', 'Update', 'Delete'];
  const [on, setOn] = useState<string[]>(['Read']);
  return (
    <div className="ex-col">
      <Checkbox
        label="All permissions"
        checked={on.length === all.length}
        indeterminate={on.length > 0}
        onChange={(v) => setOn(v ? all : [])}
      />
      <div style={{ display: 'grid', gap: 10, paddingInlineStart: 30 }}>
        {all.map((p) => (
          <Checkbox key={p} label={p} checked={on.includes(p)} onChange={(v) => setOn(v ? [...on, p] : on.filter((x) => x !== p))} />
        ))}
      </div>
    </div>
  );
}
// #endregion

function PlaygroundCheckbox({ v }: { v: PlaygroundValues }) {
  const [on, setOn] = useState(true);
  return (
    <Checkbox
      checked={on}
      onChange={setOn}
      label={String(v.label)}
      description={String(v.description) || undefined}
      indeterminate={!!v.indeterminate}
      invalid={!!v.invalid}
      disabled={!!v.disabled}
    />
  );
}

export default defineDoc({
  name: 'Checkbox',
  group: 'Form inputs',
  status: 'updated',
  description: 'Tri-state checkbox with a label and description. hideLabel keeps the name for screen readers only, for table rows.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'label', default: 'Remember this device' },
      { type: 'text', name: 'description', default: '' },
      { type: 'boolean', name: 'indeterminate', default: false },
      { type: 'boolean', name: 'invalid', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => <PlaygroundCheckbox v={v} />,
    code: (p) =>
      jsx('Checkbox', p, { indeterminate: false, invalid: false, disabled: false, description: '' }, undefined, [
        'checked={on}',
        'onChange={setOn}',
      ]),
  },
  examples: [
    { id: 'basic', title: 'With labels', description: 'The whole label is clickable.', Component: Basic },
    {
      id: 'parent',
      title: 'Select all (indeterminate)',
      description: 'The parent shows a dash when some, not all, are on.',
      Component: Parent,
    },
  ],
  a11y: ['A real <input type="checkbox">: Space toggles, and the indeterminate state is exposed as “mixed”.'],
  props: [
    { name: 'checked', type: 'boolean', description: 'On or off.' },
    { name: 'onChange', type: '(v: boolean) => void', description: 'Called with the new state.' },
    { name: 'label', type: 'ReactNode', description: 'Label text.' },
    { name: 'hideLabel', type: 'boolean', defaultValue: 'false', description: 'Screen-reader-only label.' },
    { name: 'description', type: 'ReactNode', description: 'Second line.' },
    { name: 'indeterminate', type: 'boolean', defaultValue: 'false', description: 'Show a dash.' },
    { name: 'disabled / invalid / name / value', type: '…', description: 'As native.' },
  ],
});
