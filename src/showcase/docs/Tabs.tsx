import { useState } from 'react';
import { Bell, CreditCard, Shield, User } from 'lucide-react';
import { Tabs } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Tabs.tsx?raw';

// #region line
export function Line() {
  return (
    <div className="ex-wide">
      <Tabs
        aria-label="Account"
        items={[
          {
            value: 'profile',
            label: 'Profile',
            icon: <User size={15} />,
            content: <p className="muted">Name, photo and contact details.</p>,
          },
          {
            value: 'security',
            label: 'Security',
            icon: <Shield size={15} />,
            content: <p className="muted">Password, two-step verification and sessions.</p>,
          },
          {
            value: 'alerts',
            label: 'Notifications',
            icon: <Bell size={15} />,
            badge: 3,
            content: <p className="muted">Three unread alerts.</p>,
          },
          { value: 'billing', label: 'Billing', icon: <CreditCard size={15} />, disabled: true },
        ]}
      />
    </div>
  );
}
// #endregion

// #region pill
export function Pill() {
  const [tab, setTab] = useState<'day' | 'week' | 'month'>('week');
  return (
    <div className="ex-col" style={{ alignItems: 'center' }}>
      <Tabs
        variant="pill"
        aria-label="Period"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
      <span className="muted">Selected: {tab}</span>
    </div>
  );
}
// #endregion

// #region enclosed
export function Enclosed() {
  return (
    <div className="ex-wide">
      <Tabs
        variant="enclosed"
        aria-label="Code"
        items={[
          { value: 'react', label: 'React', content: <pre className="mono">{'<Tabs items={…} />'}</pre> },
          { value: 'html', label: 'HTML', content: <pre className="mono">{'<div role="tablist">…</div>'}</pre> },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Tabs',
  group: 'Navigation',
  status: 'new',
  description: 'Switch between views in the same place. Three styles; the indicator slides between tabs and panels fade in.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'variant', options: ['line', 'pill', 'enclosed'], default: 'line' },
      { type: 'boolean', name: 'fullWidth', default: false },
      { type: 'boolean', name: 'icons', default: true },
      { type: 'boolean', name: 'badge', default: true },
      { type: 'boolean', name: 'animated', default: true },
    ],
    render: (v) => (
      <div style={{ width: 'min(560px, 100%)' }}>
        <Tabs
          aria-label="Playground tabs"
          variant={v.variant as 'line'}
          fullWidth={!!v.fullWidth}
          animated={!!v.animated}
          items={[
            {
              value: 'profile',
              label: 'Profile',
              icon: v.icons ? <User size={15} /> : undefined,
              content: <p className="muted">Profile settings</p>,
            },
            {
              value: 'security',
              label: 'Security',
              icon: v.icons ? <Shield size={15} /> : undefined,
              content: <p className="muted">Password and devices</p>,
            },
            {
              value: 'alerts',
              label: 'Alerts',
              icon: v.icons ? <Bell size={15} /> : undefined,
              badge: v.badge ? 3 : undefined,
              content: <p className="muted">Notification settings</p>,
            },
          ]}
        />
      </div>
    ),
    code: ({ icons: _i, badge: _b, ...p }) =>
      jsx('Tabs', p, { variant: 'line', fullWidth: false, animated: true }, undefined, ['items={tabs}', 'aria-label="Settings"']),
  },
  examples: [
    { id: 'line', title: 'Line', description: 'Icons, a count badge and a disabled tab.', Component: Line },
    { id: 'pill', title: 'Pill (controlled)', description: 'For filters and periods.', Component: Pill },
    { id: 'enclosed', title: 'Enclosed', description: 'Folder-style tabs.', Component: Enclosed },
  ],
  keyboard: [
    ['Tab', 'Into the tab list, then into the panel'],
    ['← + →', 'Previous or next tab (follows reading direction)'],
    ['Home + End', 'First or last tab'],
  ],
  a11y: [
    'ARIA tabs pattern: tablist, tab (aria-selected, aria-controls), tabpanel (aria-labelledby). Only the selected tab is in the Tab order.',
    'Narrow screens scroll the tab list sideways instead of wrapping.',
  ],
  props: [
    { name: 'items', type: 'TabItem[]', description: '{ value, label, icon?, badge?, disabled?, content? }' },
    { name: 'value / defaultValue / onChange', type: '…', description: 'Controlled or uncontrolled.' },
    { name: 'variant', type: "'line' | 'pill' | 'enclosed'", defaultValue: "'line'", description: 'Style.' },
    { name: 'fullWidth', type: 'boolean', defaultValue: 'false', description: 'Equal-width tabs.' },
    { name: 'animated', type: 'boolean', defaultValue: 'true', description: 'Fade panels.' },
  ],
});
