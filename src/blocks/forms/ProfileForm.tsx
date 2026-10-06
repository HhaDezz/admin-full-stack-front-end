/**
 * Profile form: photo, name, title, email and bio in a settings section, validated with Zod.
 * Uses: Form, FormSection, FormField, FileUpload, Input, Textarea, FormActions.
 */
import { z } from 'zod';
import {
  Avatar,
  Button,
  FileUpload,
  Form,
  FormActions,
  FormError,
  FormField,
  FormSection,
  Input,
  Textarea,
  useToast,
  useZodForm,
} from '@/components/kit';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  title: z.string().max(60, 'Keep it under 60 characters'),
  email: z.email('Enter a valid email address'),
  bio: z.string().max(280, 'Keep it under 280 characters'),
});

export default function ProfileForm() {
  const toast = useToast();
  const form = useZodForm(schema, {
    defaultValues: { name: 'Ada Lovelace', title: 'Head of engineering', email: 'ada@example.com', bio: '' },
  });
  const name = form.watch('name');
  return (
    <Form form={form} guard aria-label="Profile" onSubmit={async () => toast.ok('Profile saved')}>
      <div className="card blk-form">
        <FormError />
        <FormSection headingLevel={2} title="Profile" description="Shown to your team on comments and assignments.">
          <div className="blk-avatar-row">
            <Avatar name={name || '?'} size="lg" />
            <FileUpload
              compact
              multiple={false}
              accept="image/png,image/jpeg"
              maxSize={2 * 1024 * 1024}
              hint="PNG or JPG, up to 2 MB"
              aria-label="Profile photo"
            />
          </div>
          <FormField name="name" label="Full name" required>
            <Input autoComplete="name" />
          </FormField>
          <FormField name="title" label="Job title">
            <Input />
          </FormField>
          <FormField name="email" label="Email" required>
            <Input type="email" autoComplete="email" />
          </FormField>
          <FormField name="bio" label="Bio" hint="A sentence or two about what you work on.">
            <Textarea rows={3} maxLength={280} showCount />
          </FormField>
        </FormSection>
        <FormActions>
          <Button type="button" variant="ghost" onClick={() => form.reset()} disabled={!form.formState.isDirty}>
            Discard
          </Button>
          <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
            Save profile
          </Button>
        </FormActions>
      </div>
    </Form>
  );
}
