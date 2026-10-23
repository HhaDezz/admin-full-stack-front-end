import { useState } from 'react';
import { AtSign, Globe, Search } from 'lucide-react';
import { Field, Input } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Input.tsx?raw';

// #region affixes
export function Affixes() {
  return (
    <div className="ex-col">
      <Input aria-label="Search" placeholder="Search people" prefix={<Search size={16} />} />
      <Input aria-label="Username" placeholder="username" prefix={<AtSign size={15} />} />
      <Input
        aria-label="Website"
        placeholder="your-shop"
        prefix={
          <>
            <Globe size={15} /> https://
          </>
        }
        suffix=".atelier.app"
      />
    </div>
  );
}
// #endregion

// #region clearable
export function Clearable() {
  const [q, setQ] = useState('Colombo');
  return (
    <div className="ex-col">
      <Input aria-label="City" clearable value={q} onChange={(e) => setQ(e.target.value)} prefix={<Search size={16} />} />
      <span className="muted">Value: “{q}”</span>
    </div>
  );
}
// #endregion

// #region sizes
export function Sizes() {
  return (
    <div className="ex-col">
      <Input size="sm" aria-label="Small" placeholder="Small" />
      <Input aria-label="Medium" placeholder="Medium" />
      <Input size="lg" aria-label="Large" placeholder="Large" />
    </div>
  );
}
// #endregion

// #region states
export function States() {
  return (
    <div className="ex-col">
      <Field label="Invalid" error="This code has expired.">
        <Input defaultValue="X7-PROMO" />
      </Field>
      <Field label="Disabled">
        <Input disabled defaultValue="Can’t change this" />
      </Field>
      <Field label="Read only">
        <Input readOnly defaultValue="INV-2026-1042" />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Input',
  group: 'Form inputs',
  status: 'new',
  description: 'Text field with prefix and suffix slots (icons or text), a clear button, three sizes and every state.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'text', name: 'placeholder', default: 'Search users' },
      { type: 'boolean', name: 'icon', label: 'prefix', default: true },
      { type: 'boolean', name: 'clearable', default: true },
      { type: 'boolean', name: 'invalid', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(360px, 100%)' }}>
        <Input
          aria-label="Playground input"
          size={v.size as 'md'}
          placeholder={String(v.placeholder)}
          prefix={v.icon ? <Search size={16} /> : undefined}
          clearable={!!v.clearable}
          invalid={!!v.invalid}
          disabled={!!v.disabled}
          defaultValue="Grace"
        />
      </div>
    ),
    code: ({ icon, ...p }) =>
      jsx(
        'Input',
        p,
        { size: 'md', clearable: false, invalid: false, disabled: false },
        undefined,
        icon
          ? ['prefix={<Search size={16} />}', 'value={q}', 'onChange={(e) => setQ(e.target.value)}']
          : ['value={q}', 'onChange={(e) => setQ(e.target.value)}'],
      ),
  },
  examples: [
    { id: 'affixes', title: 'Prefix and suffix', description: 'Icons, text or both.', Component: Affixes },
    {
      id: 'clearable',
      title: 'Clearable',
      description: 'The × appears with text; clearing fires a normal onChange with "".',
      Component: Clearable,
    },
    { id: 'sizes', title: 'Sizes', description: 'sm, md and lg.', Component: Sizes },
    { id: 'states', title: 'States', description: 'Inside a Field for labels and errors.', Component: States },
  ],
  a11y: [
    'Give it a label through Field, or aria-label when there isn’t room.',
    'The clear button is labelled “Clear” and returns focus to the input.',
  ],
  props: [
    { name: 'prefix / suffix', type: 'ReactNode', description: 'Content inside the start / end.' },
    { name: 'clearable', type: 'boolean', defaultValue: 'false', description: 'Show × when there is text.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Height.' },
    { name: 'invalid', type: 'boolean', description: 'Error styling (Field sets it for you).' },
    { name: '…rest', type: 'InputHTMLAttributes', description: 'Any native input prop, including ref.' },
  ],
});
