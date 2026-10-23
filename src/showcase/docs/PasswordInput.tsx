import { Field, PasswordInput } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './PasswordInput.tsx?raw';

// #region strength
export function Strength() {
  return (
    <div className="ex-col">
      <Field label="New password">
        <PasswordInput strength rules autoComplete="new-password" placeholder="Try “Tailor-2026!”" />
      </Field>
    </div>
  );
}
// #endregion

// #region plain
export function Plain() {
  return (
    <div className="ex-col">
      <Field label="Password">
        <PasswordInput defaultValue="hunter22" />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'PasswordInput',
  group: 'Form inputs',
  status: 'new',
  imports: ['PasswordInput', 'passwordScore', 'defaultPasswordRules'],
  description: 'Password field with a show / hide button, an optional strength meter and a live checklist of rules.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'strength', default: true },
      { type: 'boolean', name: 'rules', default: false },
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'boolean', name: 'invalid', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(320px, 100%)' }}>
        <PasswordInput
          aria-label="Playground password"
          defaultValue="hunter2"
          strength={!!v.strength}
          rules={!!v.rules}
          size={v.size as 'md'}
          invalid={!!v.invalid}
          disabled={!!v.disabled}
        />
      </div>
    ),
    code: (p) =>
      jsx('PasswordInput', p, { strength: false, rules: false, size: 'md', invalid: false, disabled: false }, undefined, [
        'autoComplete="new-password"',
      ]),
  },
  examples: [
    {
      id: 'strength',
      title: 'Strength meter and rules',
      description: 'Type to watch the bars and the checklist update.',
      Component: Strength,
    },
    { id: 'plain', title: 'Show / hide only', description: 'For sign-in forms.', Component: Plain },
  ],
  a11y: [
    'The eye button is a toggle (aria-pressed) labelled “Show password” / “Hide password”.',
    'The strength text is linked with aria-describedby; each rule says “met” or “not met” to screen readers.',
  ],
  props: [
    { name: 'strength', type: 'boolean', defaultValue: 'false', description: 'Show the 4-step meter.' },
    { name: 'rules', type: 'boolean | PasswordRule[]', description: 'true for the defaults, or your own { label, test }.' },
    { name: '…rest', type: 'InputProps', description: 'Everything Input takes except type and suffix.' },
  ],
});
