/**
 * Activity feed: what happened recently, newest first, with icons per kind of event.
 * Uses: Card, Timeline, Avatar.
 */
import { CreditCard, MessageSquare, PackageCheck, UserPlus } from 'lucide-react';
import { Avatar, Card, Timeline } from '@/components/kit';

export default function ActivityFeed() {
  return (
    <Card headingLevel={2} title="Activity" description="Across your workspace">
      <Timeline
        aria-label="Workspace activity"
        variant="compact"
        items={[
          {
            id: 1,
            icon: <CreditCard size={15} />,
            tone: 'success',
            title: 'Order #1048 paid',
            description: 'Mei Chen · $214.50',
            time: '4 min',
          },
          {
            id: 2,
            icon: <Avatar name="Grace Hopper" size="xs" />,
            title: 'Grace commented on Atlas redesign',
            description: '“Pushed the new nav, ready for review.”',
            time: '22 min',
          },
          {
            id: 3,
            icon: <UserPlus size={15} />,
            tone: 'info',
            title: 'Katherine Johnson joined',
            description: 'Invited by Ada Lovelace',
            time: '1 h',
          },
          {
            id: 4,
            icon: <PackageCheck size={15} />,
            tone: 'brand',
            title: '42 orders shipped',
            description: 'Batch from the Lisbon warehouse',
            time: '3 h',
          },
          {
            id: 5,
            icon: <MessageSquare size={15} />,
            tone: 'warning',
            title: 'Ticket #311 escalated',
            description: 'Waiting on a reply for 2 days',
            time: '5 h',
          },
        ]}
      />
    </Card>
  );
}
