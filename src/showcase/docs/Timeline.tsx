import { CheckCircle2, CreditCard, Package, Truck, UserPlus } from 'lucide-react';
import { Avatar, Badge, Button, Card, Timeline } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Timeline.tsx?raw';

// #region order
export function Order() {
  return (
    <div style={{ width: 'min(520px, 100%)' }}>
      <Card padding="lg">
        <Timeline
          aria-label="Order #1042"
          items={[
            {
              id: 1,
              icon: <CreditCard size={15} />,
              tone: 'success',
              title: 'Payment received',
              time: 'Oct 21, 09:12',
              dateTime: '2026-10-21T09:12',
              description: '$248.00 by card ending 4242',
            },
            {
              id: 2,
              icon: <Package size={15} />,
              tone: 'success',
              title: 'Packed',
              time: 'Oct 21, 15:40',
              dateTime: '2026-10-21T15:40',
              description: '2 items, 1.2 kg',
            },
            {
              id: 3,
              icon: <Truck size={15} />,
              tone: 'brand',
              title: 'Out for delivery',
              time: 'Today, 08:05',
              dateTime: '2026-10-27T08:05',
              content: (
                <Button size="sm" variant="soft">
                  Track parcel
                </Button>
              ),
            },
          ]}
          pending="Delivery expected by 6 pm"
        />
      </Card>
    </div>
  );
}
// #endregion

// #region activity
export function Activity() {
  return (
    <div style={{ width: 'min(560px, 100%)' }}>
      <Card padding="md">
        <Timeline
          variant="compact"
          aria-label="Recent activity"
          items={[
            {
              id: 1,
              icon: <UserPlus size={15} />,
              tone: 'info',
              title: 'Grace Hopper joined',
              description: 'Invited by Ada Lovelace',
              time: '2 min ago',
            },
            {
              id: 2,
              icon: <CheckCircle2 size={15} />,
              tone: 'success',
              title: 'Role “Support” updated',
              description: '3 permissions added',
              time: '1 h ago',
            },
            {
              id: 3,
              icon: <Avatar name="Alan Turing" size="xs" />,
              title: 'Alan Turing signed in',
              description: 'Safari on macOS · 203.0.113.24',
              time: '3 h ago',
            },
            { id: 4, title: 'Weekly report sent', time: 'Yesterday' },
          ]}
        />
      </Card>
    </div>
  );
}
// #endregion

// #region changelog
export function Changelog() {
  return (
    <Timeline
      align="alternate"
      aria-label="Releases"
      items={[
        {
          id: '1.2',
          tone: 'brand',
          title: (
            <>
              Version 1.2 <Badge tone="brand">Latest</Badge>
            </>
          ),
          time: 'October 2026',
          description: 'Dashboards, charts kit and 30 blocks.',
        },
        { id: '1.1', title: 'Version 1.1', time: 'September 2026', description: 'Two-step sign-in, settings and notifications.' },
        { id: '1.0', title: 'Version 1.0', time: 'August 2026', description: 'First release: users, roles, permissions and audit log.' },
      ]}
    />
  );
}
// #endregion

export default defineDoc({
  name: 'Timeline',
  group: 'Data display',
  status: 'new',
  description:
    'Events in order with a line between them: order tracking, activity logs, histories and changelogs. Icons and tones per event, a pending last step and an alternating layout.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'variant', options: ['default', 'compact'], default: 'default' },
      { type: 'select', name: 'align', options: ['start', 'alternate'], default: 'start' },
      { type: 'boolean', name: 'icons', default: true },
      { type: 'boolean', name: 'pending', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(620px, 100%)' }}>
        <Timeline
          variant={v.variant as 'default'}
          align={v.align as 'start'}
          aria-label="Playground timeline"
          pending={v.pending ? 'Waiting for approval' : undefined}
          items={[
            {
              id: 1,
              tone: 'success',
              icon: v.icons ? <CheckCircle2 size={15} /> : undefined,
              title: 'Request created',
              time: '09:12',
              description: 'By Ada Lovelace',
            },
            {
              id: 2,
              tone: 'info',
              icon: v.icons ? <UserPlus size={15} /> : undefined,
              title: 'Reviewer assigned',
              time: '10:30',
              description: 'Grace Hopper',
            },
            { id: 3, title: 'Comment added', time: '11:05', description: 'Looks good, one question about the budget.' },
          ]}
        />
      </div>
    ),
    code: ({ icons: _i, pending, ...p }) =>
      jsx('Timeline', p, { variant: 'default', align: 'start' }, undefined, [
        'items={events}',
        ...(pending ? ['pending="Waiting for approval"'] : []),
      ]),
  },
  examples: [
    {
      id: 'order',
      title: 'Order tracking',
      description: 'Icons, tones, extra content under an event and a pending last step.',
      Component: Order,
    },
    {
      id: 'activity',
      title: 'Activity log',
      description: 'variant="compact": one line per event with the time at the end. Any element can go in the dot.',
      Component: Activity,
    },
    {
      id: 'changelog',
      title: 'Changelog',
      description: 'align="alternate" puts the date on the other side of the line on wide screens.',
      Component: Changelog,
    },
  ],
  a11y: [
    'An ordered list; give it an aria-label that says what the events are about.',
    'Pass dateTime with an ISO date so the time is a real <time> element.',
    'Icons are decorative; the title carries the meaning, so tone is never the only signal.',
  ],
  props: [
    { name: 'items', type: 'TimelineItem[]', description: '{ id, title, description?, time?, dateTime?, icon?, tone?, content? }' },
    {
      name: 'variant',
      type: "'default' | 'compact'",
      defaultValue: "'default'",
      description: 'Stacked, or one line with the time at the end.',
    },
    {
      name: 'align',
      type: "'start' | 'alternate'",
      defaultValue: "'start'",
      description: 'Time beside the title, or on the other side of the line.',
    },
    { name: 'pending', type: 'ReactNode', description: 'A last step with a spinner.' },
    { name: 'aria-label', type: 'string', description: 'What the events are about.' },
  ],
});
