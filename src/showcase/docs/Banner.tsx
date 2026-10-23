import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Banner, Button } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Banner.tsx?raw';

// #region basic
export function Basic() {
  const [shown, setShown] = useState(true);
  return (
    <div className="ex-wide" style={{ display: 'grid', gap: 10 }}>
      {shown ? (
        <Banner icon={<Sparkles size={17} />} action={<Button size="sm">See what’s new</Button>} onDismiss={() => setShown(false)}>
          Anjana Admin 1.2 adds the Kanban board and saved filters.
        </Banner>
      ) : (
        <Button onClick={() => setShown(true)}>Show banner</Button>
      )}
      <Banner tone="warning" aria-label="Maintenance notice">
        Scheduled maintenance on Sunday, 02:00 – 03:00 UTC.
      </Banner>
      <Banner tone="neutral" icon={false} aria-label="Cookie notice">
        You’re viewing the demo. Changes reset every hour.
      </Banner>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Banner',
  group: 'Feedback',
  status: 'new',
  description: 'A full-width strip for announcements that apply to the whole app: releases, maintenance, demo mode. Can stick to the top.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'tone', options: ['neutral', 'brand', 'info', 'success', 'warning', 'danger'], default: 'info' },
      { type: 'text', name: 'children', label: 'text', default: 'Scheduled maintenance on Sunday, 02:00–03:00 UTC.' },
      { type: 'boolean', name: 'action', default: true },
      { type: 'boolean', name: 'dismiss', label: 'onDismiss', default: true },
      { type: 'boolean', name: 'icon', default: true },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <Banner
          aria-label="Playground announcement"
          tone={v.tone as 'info'}
          icon={v.icon ? undefined : false}
          action={v.action ? <Button size="sm">Details</Button> : undefined}
          onDismiss={v.dismiss ? () => {} : undefined}
        >
          {String(v.children)}
        </Banner>
      </div>
    ),
    code: ({ children, action, dismiss, icon, ...p }) =>
      jsx('Banner', p, { tone: 'info' }, String(children), [
        ...(icon ? [] : ['icon={false}']),
        ...(action ? ['action={<Button size="sm">Details</Button>}'] : []),
        ...(dismiss ? ['onDismiss={hide}'] : []),
      ]),
  },
  examples: [{ id: 'basic', title: 'Announcements', description: 'Dismissible, with an action.', Component: Basic }],
  a11y: ['A labelled region (“Announcement”), so people can find or skip it.'],
  props: [
    { name: 'tone', type: 'Tone', defaultValue: "'brand'", description: 'Colour.' },
    { name: 'children', type: 'ReactNode', description: 'Message.' },
    { name: 'icon / action / onDismiss', type: '…', description: 'As Alert.' },
    { name: 'sticky', type: 'boolean', defaultValue: 'false', description: 'Stick to the top.' },
  ],
});
