import { useState } from 'react';
import { CreditCard, MessageSquare, Package, ShieldAlert, UserPlus } from 'lucide-react';
import { Button, NotificationCenter, NotificationPanel, useToast, type NotificationItem } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './NotificationCenter.tsx?raw';

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

// #region bell
const START: NotificationItem[] = [
  { id: 'n1', title: 'Order #1042 shipped', body: 'Arrives Thursday', at: ago(4), icon: <Package size={16} />, tone: 'ok' },
  {
    id: 'n2',
    title: 'Amara mentioned you',
    body: '“@you can you check the sizes?”',
    at: ago(38),
    icon: <MessageSquare size={16} />,
    tone: 'info',
  },
  { id: 'n3', title: 'New sign-in from Chrome on Windows', at: ago(190), icon: <ShieldAlert size={16} />, tone: 'warn', read: true },
  { id: 'n4', title: 'Payout of $4,210 sent', at: ago(60 * 30), icon: <CreditCard size={16} />, tone: 'brand', read: true },
];

export function Bell() {
  const toast = useToast();
  const [items, setItems] = useState(START);
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: 'min(420px, 100%)' }}>
      <NotificationCenter
        items={items}
        onItemClick={(n) => {
          setItems((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
          toast.info('Open the notification');
        }}
        onRead={(id, read) => setItems((l) => l.map((x) => (x.id === id ? { ...x, read } : x)))}
        onReadAll={() => setItems((l) => l.map((x) => ({ ...x, read: true })))}
        onDismiss={(id) => setItems((l) => l.filter((x) => x.id !== id))}
        footer={
          <>
            <a href="#bell">See all</a>
            <a href="#bell" className="muted">
              Settings
            </a>
          </>
        }
      />
    </div>
  );
}
// #endregion

// #region panel
export function Panel() {
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: 'i1',
      title: 'Kasun invited you to “Spring launch”',
      at: ago(12),
      icon: <UserPlus size={16} />,
      tone: 'brand',
      actions: (
        <>
          <Button size="sm" variant="primary" onClick={() => setItems([])}>
            Accept
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setItems([])}>
            Decline
          </Button>
        </>
      ),
    },
  ]);
  return (
    <div className="card" style={{ width: 'min(400px, 100%)', padding: 0 }}>
      <NotificationPanel items={items} title="Invitations" onDismiss={(id) => setItems((l) => l.filter((x) => x.id !== id))} />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'NotificationCenter',
  group: 'Apps & advanced',
  status: 'new',
  description:
    'A bell with an unread count that opens the latest notifications: All and Unread tabs, Today and Earlier groups, mark read, dismiss and inline actions. NotificationPanel is the same list for a page or drawer.',
  imports: ['NotificationCenter', 'NotificationPanel', 'type NotificationItem'],
  raw,
  examples: [
    {
      id: 'bell',
      title: 'Top-bar bell',
      description: 'Hover a row to mark it read or unread, or dismiss it (on touch screens the buttons are always shown).',
      Component: Bell,
    },
    {
      id: 'panel',
      title: 'Panel with actions',
      description: 'NotificationPanel on its own; actions put buttons under a notification.',
      Component: Panel,
    },
  ],
  keyboard: [
    ['Enter / Space', 'Open the panel from the bell'],
    ['Tab', 'Move through tabs, notifications and their buttons'],
    ['Escape', 'Close and return to the bell'],
  ],
  a11y: [
    'The bell’s name includes the count (“Notifications, 2 unread”); the badge itself is hidden from screen readers.',
    'Unread rows start with “Unread:” for screen readers, not only a dot.',
    'The tabs are toggle buttons with aria-pressed; the groups are named sections.',
    'Dismissed rows fold away, or fade with reduced motion.',
  ],
  props: [
    { name: 'items', type: 'NotificationItem[]', description: '{ id, title, body?, at, read?, icon?, tone?, actions? }' },
    { name: 'onItemClick', type: '(item) => void', description: 'Click a title (the panel closes).' },
    { name: 'onRead', type: '(id, read) => void', description: 'Shows the mark read / unread button.' },
    { name: 'onReadAll', type: '() => void', description: 'Shows “Mark all read”.' },
    { name: 'onDismiss', type: '(id) => void', description: 'Shows the dismiss button.' },
    { name: 'footer', type: 'ReactNode', description: 'Links under the list.' },
    { name: 'title', type: 'string', defaultValue: "'Notifications'", description: 'Heading and bell name.' },
    { name: 'width', type: 'number', defaultValue: '380', description: 'Panel width.' },
    { name: 'loading', type: 'boolean', description: 'Skeleton rows.' },
    { name: 'trigger', type: '(unread) => ReactElement', description: 'Your own button instead of the bell.' },
  ],
});
