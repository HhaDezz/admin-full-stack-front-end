import { useState } from 'react';
import { Button, Field, PinInput, useToast } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './PinInput.tsx?raw';

// #region verify
export function Verify() {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [bad, setBad] = useState(false);
  return (
    <div className="ex-col" style={{ alignItems: 'flex-start' }}>
      <Field label="Six-digit code" hint="Try 000000 to see the error." error={bad ? 'That code didn’t work.' : undefined}>
        <PinInput
          value={code}
          groupAfter={3}
          invalid={bad}
          onChange={(v) => {
            setCode(v);
            setBad(false);
          }}
          onComplete={(v) => (v === '000000' ? setBad(true) : toast.ok(`Verified ${v}`))}
        />
      </Field>
      <Button size="sm" variant="ghost" onClick={() => setCode('')}>
        Clear
      </Button>
    </div>
  );
}
// #endregion

// #region variants
export function Variants() {
  return (
    <div className="ex-col" style={{ alignItems: 'flex-start' }}>
      <PinInput aria-label="PIN" length={4} mask size="md" />
      <PinInput aria-label="Invite code" length={8} type="alphanumeric" groupAfter={4} size="md" />
      <PinInput aria-label="Disabled code" length={4} defaultValue="1234" disabled size="md" />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'PinInput',
  group: 'Form inputs',
  status: 'new',
  description:
    'One box per character for verification codes and PINs. Paste a whole code, autofill from SMS, and submit as the last box fills.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'length', default: 6, min: 3, max: 8 },
      { type: 'select', name: 'type', options: ['numeric', 'alphanumeric'], default: 'numeric' },
      { type: 'number', name: 'groupAfter', default: 3, min: 0, max: 4 },
      { type: 'select', name: 'size', options: ['md', 'lg'], default: 'lg' },
      { type: 'boolean', name: 'mask', default: false },
      { type: 'boolean', name: 'invalid', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <PinInput
        key={`${v.length}-${v.type}`}
        aria-label="Playground code"
        length={Number(v.length)}
        type={v.type as 'numeric'}
        groupAfter={Number(v.groupAfter) || undefined}
        size={v.size as 'lg'}
        mask={!!v.mask}
        invalid={!!v.invalid}
        disabled={!!v.disabled}
      />
    ),
    code: (p) =>
      jsx(
        'PinInput',
        p,
        { length: 6, type: 'numeric', groupAfter: 0, size: 'lg', mask: false, invalid: false, disabled: false },
        undefined,
        ['onComplete={verify}'],
      ),
  },
  examples: [
    {
      id: 'verify',
      title: 'Verification code',
      description: 'onComplete fires once every box is filled, so there’s no button to press.',
      Component: Verify,
    },
    {
      id: 'variants',
      title: 'PIN, letters and disabled',
      description: 'mask hides the characters; alphanumeric accepts letters and upper-cases them.',
      Component: Variants,
    },
  ],
  keyboard: [
    ['Left / Right', 'Previous or next box'],
    ['Backspace', 'Clear this box, or the previous one when empty'],
    ['Home / End', 'First or last box'],
    ['mod V', 'Paste a code into every box'],
  ],
  a11y: [
    'The boxes sit in a group named by aria-label (or the Field label); each box is announced as “Digit 2 of 6” (“Character 2 of 8” for letters).',
    'The first box has autocomplete="one-time-code", so phones offer the code from a text message.',
    'Numeric codes use inputmode="numeric" for the number keypad.',
  ],
  props: [
    { name: 'length', type: 'number', defaultValue: '6', description: 'Number of boxes.' },
    { name: 'value / defaultValue', type: 'string', description: 'The code so far.' },
    { name: 'onChange', type: '(v: string) => void', description: 'Every change.' },
    { name: 'onComplete', type: '(v: string) => void', description: 'Once all boxes are filled.' },
    { name: 'type', type: "'numeric' | 'alphanumeric'", defaultValue: "'numeric'", description: 'What may be typed.' },
    { name: 'mask', type: 'boolean', defaultValue: 'false', description: 'Hide characters like a password.' },
    { name: 'groupAfter', type: 'number', description: 'A gap after this many boxes ("123 456").' },
    { name: 'size', type: "'md' | 'lg'", defaultValue: "'lg'", description: 'Box size.' },
    { name: 'invalid / disabled / autoFocus', type: 'boolean', description: 'States.' },
  ],
});
