import { useState } from 'react';
import { Button, Field, Input, Textarea } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Field.tsx?raw';

// #region basic
export function Basic() {
  const [email, setEmail] = useState('ada@');
  const invalid = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email);
  return (
    <div className="ex-col">
      <Field label="Full name" required hint="As it appears on your ID.">
        <Input placeholder="Ada Lovelace" />
      </Field>
      <Field label="Work email" required error={invalid ? 'Enter an email like name@company.com' : undefined}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field
        label="Password"
        labelAside={
          <Button variant="link" size="sm">
            Forgot password?
          </Button>
        }
      >
        <Input type="password" />
      </Field>
      <Field label="Notes" disabled>
        <Textarea placeholder="Disabled field" />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Field',
  group: 'Forms',
  status: 'new',
  description: 'Wraps any control with a label, hint, error and required mark, and wires up the ids for you.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'label', default: 'Work email' },
      { type: 'text', name: 'hint', default: 'We’ll send the invite here.' },
      { type: 'text', name: 'error', default: '' },
      { type: 'boolean', name: 'required', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(360px, 100%)' }}>
        <Field
          label={String(v.label)}
          hint={String(v.hint) || undefined}
          error={String(v.error) || undefined}
          required={!!v.required}
          disabled={!!v.disabled}
        >
          <Input type="email" placeholder="name@company.com" />
        </Field>
      </div>
    ),
    code: (p) => jsx('Field', p, { hint: '', error: '', required: false, disabled: false }, '\n  <Input type="email" />\n'),
  },
  examples: [
    {
      id: 'basic',
      title: 'Label, hint, error',
      description: 'Type a valid email to clear the error. The error replaces the hint and is linked to the input.',
      Component: Basic,
    },
  ],
  a11y: [
    'The label’s for, the control’s id and aria-describedby (error and hint) are connected automatically through context.',
    'An error sets aria-invalid on the control and is announced (role="alert").',
    'The required star is decorative; the control gets the real required attribute.',
  ],
  props: [
    { name: 'label', type: 'ReactNode', description: 'Visible label.' },
    { name: 'hint', type: 'ReactNode', description: 'Help text under the control.' },
    { name: 'error', type: 'ReactNode', description: 'Error text; marks the control invalid.' },
    { name: 'required / disabled', type: 'boolean', description: 'Passed down to the control.' },
    { name: 'labelAside', type: 'ReactNode', description: 'Right side of the label row.' },
    { name: 'id', type: 'string', description: 'Use your own control id.' },
  ],
});
