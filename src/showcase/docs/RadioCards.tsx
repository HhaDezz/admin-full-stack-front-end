import { useState } from 'react';
import { Building2, Rocket, Sparkles, User } from 'lucide-react';
import { RadioCards } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './RadioCards.tsx?raw';

// #region plans
export function Plans() {
  const [plan, setPlan] = useState<'solo' | 'team' | 'org'>('team');
  return (
    <div className="ex-wide">
      <RadioCards
        label="Plan"
        value={plan}
        onChange={setPlan}
        options={[
          { value: 'solo', label: 'Solo', description: 'One admin, up to 50 users.', icon: <User size={18} /> },
          { value: 'team', label: 'Team', description: 'Five admins and audit history.', icon: <Rocket size={18} /> },
          { value: 'org', label: 'Organisation', description: 'Unlimited admins, SSO and support.', icon: <Building2 size={18} /> },
        ]}
      />
    </div>
  );
}
// #endregion

// #region compact
export function Compact() {
  return (
    <div className="ex-wide">
      <RadioCards
        aria-label="Start from"
        minCardWidth={160}
        defaultValue="blank"
        options={[
          { value: 'blank', label: 'Blank role' },
          { value: 'copy', label: 'Copy of Admin', icon: <Sparkles size={16} /> },
          { value: 'import', label: 'Import (soon)', disabled: true },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'RadioCards',
  group: 'Form inputs',
  status: 'new',
  description:
    'A RadioGroup laid out as cards with an icon, title and description: plans, delivery options, templates. Wraps to fit the space.',
  imports: ['RadioCards'],
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'minCardWidth', default: 200, min: 120, max: 320, step: 20 },
      { type: 'boolean', name: 'icons', default: true },
      { type: 'boolean', name: 'descriptions', default: true },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <RadioCards
          aria-label="Playground options"
          minCardWidth={Number(v.minCardWidth)}
          disabled={!!v.disabled}
          defaultValue="b"
          options={['a', 'b', 'c'].map((k, i) => ({
            value: k,
            label: ['Starter', 'Growth', 'Scale'][i],
            description: v.descriptions ? ['For trying things out.', 'For a growing team.', 'For the whole company.'][i] : undefined,
            icon: v.icons ? [<User key="u" size={18} />, <Rocket key="r" size={18} />, <Building2 key="b" size={18} />][i] : undefined,
          }))}
        />
      </div>
    ),
    code: ({ minCardWidth, disabled }) =>
      jsx('RadioCards', { minCardWidth, disabled }, { minCardWidth: 200, disabled: false }, undefined, [
        'options={options}',
        'value={value}',
        'onChange={setValue}',
      ]),
  },
  examples: [
    { id: 'plans', title: 'Plans', description: 'An icon, title and description per card.', Component: Plans },
    {
      id: 'compact',
      title: 'Narrow cards',
      description: 'minCardWidth sets how narrow a card may get before the grid wraps.',
      Component: Compact,
    },
  ],
  keyboard: [
    ['Tab', 'Into the group (to the chosen card)'],
    ['Arrow keys', 'Choose the next or previous card'],
  ],
  a11y: [
    'Built on native radio buttons, so the group, the choice and its position are announced without extra ARIA.',
    'The description is linked to its radio with aria-describedby.',
  ],
  props: [
    { name: 'options', type: '{ value, label, description?, icon?, disabled? }[]', description: 'The cards.' },
    { name: 'value / defaultValue', type: 'string', description: 'The chosen value.' },
    { name: 'onChange', type: '(v) => void', description: 'New choice.' },
    { name: 'label / aria-label', type: 'ReactNode / string', description: 'Visible legend, or a name for screen readers.' },
    { name: 'minCardWidth', type: 'number', defaultValue: '200', description: 'Smallest card width in px.' },
    { name: 'disabled / error / name', type: '…', description: 'As on RadioGroup.' },
  ],
});
