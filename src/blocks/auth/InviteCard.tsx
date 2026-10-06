/**
 * Invitation: who invited you, to what, with which role, and buttons to join or decline.
 * Uses: Avatar, Badge, Button, DescriptionList.
 */
import { Avatar, Badge, Button, DescriptionList, useToast } from '@/components/kit';

export default function InviteCard() {
  const toast = useToast();
  return (
    <div className="card blk-auth blk-center">
      <Avatar name="Grace Hopper" size="lg" />
      <h2 className="blk-h2">Join Anjana Admin</h2>
      <p className="muted">
        <b>Grace Hopper</b> invited you to the <b>Anjana Admin</b> workspace.
      </p>
      <DescriptionList
        layout="inline"
        bordered
        items={[
          { term: 'Your role', details: <Badge tone="brand">Member</Badge> },
          { term: 'Email', details: 'you@company.com' },
          { term: 'Expires', details: 'in 6 days' },
        ]}
      />
      <div className="blk-actions blk-actions-full">
        <Button variant="ghost" onClick={() => toast.info('Invitation declined')}>
          Decline
        </Button>
        <Button variant="primary" onClick={() => toast.ok('Welcome to Anjana Admin')}>
          Accept and join
        </Button>
      </div>
    </div>
  );
}
