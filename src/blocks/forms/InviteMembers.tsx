/**
 * Invite members: paste or type emails, pick a role, add a note, send.
 * Uses: Card, TagInput, RadioCards, Textarea, Field, Button.
 */
import { useState } from 'react';
import { Eye, Pencil, ShieldCheck } from 'lucide-react';
import { Button, Card, Field, RadioCards, TagInput, Textarea, useToast } from '@/components/kit';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteMembers() {
  const toast = useToast();
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [sending, setSending] = useState(false);
  const send = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    toast.ok(`Invited ${emails.length} ${emails.length === 1 ? 'person' : 'people'}`);
    setEmails([]);
  };
  return (
    <Card headingLevel={2} title="Invite people" description="They’ll get an email with a link that works for 7 days.">
      <div className="blk-stack">
        <Field label="Email addresses" hint="Paste a list or press Enter after each address.">
          <TagInput
            value={emails}
            onChange={setEmails}
            lowercase
            max={20}
            validate={(t) => (EMAIL.test(t) ? null : `“${t}” isn’t an email address`)}
            placeholder="name@company.com"
          />
        </Field>
        <RadioCards
          label="Role"
          value={role}
          onChange={setRole}
          minCardWidth={150}
          options={[
            { value: 'admin', label: 'Admin', description: 'Everything, including billing', icon: <ShieldCheck size={16} /> },
            { value: 'member', label: 'Member', description: 'Create and edit', icon: <Pencil size={16} /> },
            { value: 'viewer', label: 'Viewer', description: 'Read only', icon: <Eye size={16} /> },
          ]}
        />
        <Field label="Note" hint="Optional, added to the email.">
          <Textarea rows={2} placeholder="Welcome aboard!" />
        </Field>
        <div className="blk-actions">
          <Button variant="primary" disabled={!emails.length} loading={sending} onClick={send}>
            Send {emails.length ? emails.length : ''} {emails.length === 1 ? 'invite' : 'invites'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
