import { useState } from 'react';
import { RadioGroup } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './RadioGroup.tsx?raw';

// #region basic
export function Basic() {
  const [ship, setShip] = useState<'std' | 'exp' | 'pick'>('std');
  return (
    <div className="ex-col">
      <RadioGroup
        label="Delivery"
        value={ship}
        onChange={setShip}
        options={[
          { value: 'std', label: 'Standard', description: '3–5 working days · free' },
          { value: 'exp', label: 'Express', description: 'Next working day · $9' },
          { value: 'pick', label: 'Collect in store', description: 'Unavailable for this order', disabled: true },
        ]}
      />
    </div>
  );
}
// #endregion

// #region cards
export function Cards() {
  return (
    <div className="ex-wide">
      <RadioGroup
        aria-label="Plan"
        variant="cards"
        defaultValue="team"
        options={[
          { value: 'solo', label: 'Solo · $9', description: 'One admin, 1,000 records' },
          { value: 'team', label: 'Team · $29', description: '10 admins, roles and audit log' },
          { value: 'org', label: 'Organisation · $99', description: 'Unlimited, SSO and priority support' },
        ]}
      />
    </div>
  );
}
// #endregion

// #region inline
export function Inline() {
  return (
    <RadioGroup
      aria-label="Size"
      orientation="horizontal"
      defaultValue="m"
      options={['XS', 'S', 'M', 'L', 'XL'].map((s) => ({ value: s.toLowerCase(), label: s }))}
    />
  );
}
// #endregion

export default defineDoc({
  name: 'RadioGroup',
  group: 'Form inputs',
  status: 'new',
  description: 'Choose one option from a short list, as plain radios, a row, or selectable cards (RadioCards).',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'orientation', options: ['vertical', 'horizontal'], default: 'vertical' },
      { type: 'select', name: 'variant', options: ['plain', 'cards'], default: 'plain' },
      { type: 'text', name: 'label', default: 'Billing' },
      { type: 'boolean', name: 'descriptions', default: true },
      { type: 'text', name: 'error', default: '' },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <RadioGroup
        label={String(v.label) || undefined}
        aria-label={String(v.label) ? undefined : 'Billing'}
        orientation={v.orientation as 'vertical'}
        variant={v.variant as 'plain'}
        error={String(v.error) || undefined}
        disabled={!!v.disabled}
        defaultValue="month"
        options={[
          { value: 'month', label: 'Monthly', description: v.descriptions ? '$12 a month' : undefined },
          { value: 'year', label: 'Yearly', description: v.descriptions ? '$120 a year, two months free' : undefined },
        ]}
      />
    ),
    code: ({ descriptions: _d, ...p }) =>
      jsx('RadioGroup', p, { orientation: 'vertical', variant: 'plain', label: '', error: '', disabled: false }, undefined, [
        'options={options}',
        'value={value}',
        'onChange={setValue}',
      ]),
  },
  examples: [
    { id: 'basic', title: 'With descriptions', description: 'One option disabled.', Component: Basic },
    { id: 'cards', title: 'Cards', description: 'variant="cards" for plans, delivery or anything that needs more room.', Component: Cards },
    { id: 'inline', title: 'Horizontal', description: 'For short options.', Component: Inline },
  ],
  keyboard: [
    ['Tab', 'Move to the selected option'],
    ['↑ + ↓', 'Select the previous or next option (← → too)'],
  ],
  a11y: ['Native radios in a <fieldset> with a <legend>, so grouping and arrow-key behaviour come from the browser.'],
  props: [
    { name: 'options', type: 'RadioOption[]', description: '{ value, label, description?, disabled? }' },
    { name: 'value / defaultValue', type: 'V | null', description: 'Controlled or starting value.' },
    { name: 'onChange', type: '(v: V) => void', description: 'Called with the new value.' },
    { name: 'label / aria-label', type: 'ReactNode / string', description: 'Group name.' },
    { name: 'variant', type: "'plain' | 'cards'", defaultValue: "'plain'", description: 'Style.' },
    { name: 'orientation', type: "'vertical' | 'horizontal'", defaultValue: "'vertical'", description: 'Layout.' },
    { name: 'error / disabled / name', type: '…', description: 'Error text, disable all, form name.' },
  ],
});
