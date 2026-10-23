import { useState } from 'react';
import { Divider, Switch } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx, type PlaygroundValues } from '../Playground';
import raw from './Switch.tsx?raw';

// #region basic
export function Basic() {
  const [on, setOn] = useState(true);
  const [small, setSmall] = useState(false);
  return (
    <div className="ex-col">
      <Switch checked={on} onChange={setOn} label="Two-step verification" />
      <Switch size="sm" checked={small} onChange={setSmall} label="Compact (sm)" />
      <Switch checked onChange={() => {}} label="Disabled" disabled />
    </div>
  );
}
// #endregion

// #region settings
export function Settings() {
  const [s, set] = useState({ digest: true, mentions: true, marketing: false });
  return (
    <div className="card card-pad ex-col">
      <Switch
        labelFirst
        checked={s.digest}
        onChange={(v) => set({ ...s, digest: v })}
        label="Daily digest"
        description="A summary of yesterday’s activity at 8:00."
      />
      <Divider />
      <Switch
        labelFirst
        checked={s.mentions}
        onChange={(v) => set({ ...s, mentions: v })}
        label="Mentions"
        description="When someone @mentions you."
      />
      <Divider />
      <Switch labelFirst checked={s.marketing} onChange={(v) => set({ ...s, marketing: v })} label="Tips and offers" />
    </div>
  );
}
// #endregion

function PlaygroundSwitch({ v }: { v: PlaygroundValues }) {
  const [on, setOn] = useState(true);
  return (
    <Switch
      checked={on}
      onChange={setOn}
      label={String(v.label)}
      description={String(v.description) || undefined}
      size={v.size as 'md'}
      labelFirst={!!v.labelFirst}
      disabled={!!v.disabled}
    />
  );
}

export default defineDoc({
  name: 'Switch',
  group: 'Form inputs',
  status: 'new',
  description:
    'An on / off setting that takes effect straight away. Two sizes, with an optional description and label-first layout for settings rows.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'label', default: 'Email notifications' },
      { type: 'text', name: 'description', default: 'A summary every Monday.' },
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'labelFirst', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => <PlaygroundSwitch v={v} />,
    code: (p) =>
      jsx('Switch', p, { size: 'md', labelFirst: false, disabled: false, description: '' }, undefined, [
        'checked={on}',
        'onChange={setOn}',
      ]),
  },
  examples: [
    { id: 'basic', title: 'Basic', description: 'The thumb slides with a short ease.', Component: Basic },
    { id: 'settings', title: 'Settings list', description: 'labelFirst puts the switch at the end of the row.', Component: Settings },
  ],
  a11y: ['A checkbox with role="switch", so it is announced as “on” or “off”; Space toggles it.'],
  props: [
    { name: 'checked / onChange', type: 'boolean / (v) => void', description: 'State.' },
    { name: 'label', type: 'ReactNode', description: 'Label.' },
    { name: 'description', type: 'ReactNode', description: 'Second line.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Size.' },
    { name: 'labelFirst', type: 'boolean', defaultValue: 'false', description: 'Text first, switch at the end.' },
    { name: 'hideLabel / disabled', type: 'boolean', description: 'Screen-reader-only label; disable.' },
  ],
});
