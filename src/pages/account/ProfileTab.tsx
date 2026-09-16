import { z } from 'zod';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Form,
  FormActions,
  FormError,
  FormField,
  FormSection,
  Input,
  Textarea,
  useToast,
  useZodForm,
} from '../../components/kit';
import { api, unwrap } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { titleCase } from '../../lib/format';
import type { Session } from '../../lib/types';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .max(40, 'Phone is too long')
    .refine((v) => !v || /^[+()\d\s.-]{6,}$/.test(v), 'Enter a phone number, e.g. +1 415 555 0132'),
  address: z.string().trim().max(255, 'Address is too long'),
});

export default function ProfileTab() {
  const { session, updateSession } = useAuth();
  const toast = useToast();
  const form = useZodForm(schema, {
    defaultValues: { name: session?.name ?? '', phone: session?.phone ?? '', address: session?.address ?? '' },
  });
  const name = form.watch('name') || session?.name || '';

  return (
    <div className="settings-grid">
      <Card padding="lg">
        <Form
          form={form}
          guard
          aria-label="Profile"
          onSubmit={async (v) => {
            const me = await unwrap<Partial<Session>>(api.put('/me', v));
            updateSession(me);
            toast.ok('Profile saved');
          }}
        >
          <FormError />
          <FormSection headingLevel={2} title="Personal details" description="How you appear to the rest of your team.">
            <FormField name="name" label="Full name" required>
              <Input autoComplete="name" />
            </FormField>
            <div className="form-grid-2">
              <FormField name="phone" label="Phone" hint="Optional">
                <Input type="tel" autoComplete="tel" />
              </FormField>
              <div className="field">
                <div className="field-label-row">
                  <label htmlFor="me-email">Email</label>
                </div>
                <Input id="me-email" value={session?.email ?? ''} readOnly disabled aria-describedby="me-email-hint" />
                <div className="hint" id="me-email-hint">
                  Ask an administrator to change your email.
                </div>
              </div>
            </div>
            <FormField name="address" label="Address" hint="Optional">
              <Textarea autosize minRows={2} autoComplete="street-address" />
            </FormField>
          </FormSection>
          <FormActions>
            <Button onClick={() => form.reset()} disabled={!form.formState.isDirty || form.formState.isSubmitting}>
              Discard
            </Button>
            <Button type="submit" variant="primary" loading={form.formState.isSubmitting} disabled={!form.formState.isDirty}>
              Save changes
            </Button>
          </FormActions>
        </Form>
      </Card>
      <Card padding="lg" className="profile-card">
        <Avatar name={name || 'You'} size={84} />
        <h2>{name || 'Your name'}</h2>
        <p className="muted">{session?.email}</p>
        <div className="chips">
          {(session?.roles ?? []).map((r) => (
            <Badge key={r} seed={r}>
              {titleCase(r)}
            </Badge>
          ))}
        </div>
        <p className="muted profile-note">Your avatar uses your initials and a colour picked from your name.</p>
      </Card>
    </div>
  );
}
