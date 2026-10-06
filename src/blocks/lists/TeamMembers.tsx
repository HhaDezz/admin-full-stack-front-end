/**
 * Team members: people with their role, a role menu per person and an invite button.
 * Uses: Card, List, Avatar, Badge, DropdownMenu, Button.
 */
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { Avatar, Badge, Button, Card, DropdownMenu, IconButton, List, useToast } from '@/components/kit';
import { PEOPLE } from '../_data';

export default function TeamMembers() {
  const toast = useToast();
  return (
    <Card
      headingLevel={2}
      title="Team"
      description={`${PEOPLE.length} people`}
      padding="sm"
      actions={
        <Button size="sm" variant="soft" iconStart={<UserPlus size={15} />} onClick={() => toast.info('Invite people')}>
          Invite
        </Button>
      }
    >
      <List
        aria-label="Team members"
        variant="plain"
        items={PEOPLE.map((p) => ({
          id: p.email,
          leading: <Avatar name={p.name} size="sm" />,
          title: p.name,
          description: p.email,
          meta: <Badge tone={p.role === 'Owner' ? 'brand' : 'neutral'}>{p.role}</Badge>,
          actions:
            p.role === 'Owner' ? undefined : (
              <DropdownMenu
                label={`Actions for ${p.name}`}
                align="end"
                trigger={<IconButton label={`Actions for ${p.name}`} icon={<MoreHorizontal size={16} />} size="sm" tooltip={false} />}
                items={[
                  { type: 'label', label: 'Change role' },
                  ...['Admin', 'Member', 'Viewer'].map((r) => ({
                    type: 'checkbox' as const,
                    label: r,
                    checked: p.role === r,
                    onCheckedChange: () => toast.ok(`${p.name} is now ${r}`),
                  })),
                  { type: 'separator' },
                  { label: 'Remove from team', danger: true, onSelect: () => toast.err(`${p.name} removed`) },
                ]}
              />
            ),
        }))}
      />
    </Card>
  );
}
