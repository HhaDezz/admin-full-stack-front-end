# Forms

Forms use React Hook Form with Zod. One schema gives you the types, the validation and the error messages.

```tsx
import { z } from 'zod';
import { Button, Form, FormActions, FormError, FormField, Input, useZodForm } from '@/components/kit';
import { api } from '@/lib/api';

const schema = z.object({
  name: z.string().trim().min(1, 'Enter a name'),
  email: z.email('Enter a valid email address'),
});

export function InviteForm() {
  const form = useZodForm(schema, { defaultValues: { name: '', email: '' } });
  return (
    <Form form={form} guard onSubmit={(v) => api.post('/users', v)}>
      <FormError />
      <FormField name="name" label="Name" required>
        <Input />
      </FormField>
      <FormField name="email" label="Email" required>
        <Input type="email" />
      </FormField>
      <FormActions>
        <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
          Save
        </Button>
      </FormActions>
    </Form>
  );
}
```

What you get without writing it:

- **Timing that doesn't nag.** A field checks itself when it loses focus, then as you type once it has been flagged.
- **API errors in the right place.** If `onSubmit` throws (or the request fails) and the API answered `{ message, data: { email: "Already in use" } }`, the message appears under the email field. Anything that isn't about one field shows in `<FormError />`.
- **Unsaved-changes guard.** With `guard`, leaving the page through a link or closing the tab asks first.
- **Labels, hints and errors wired up.** `FormField` gives its input the label, hint and error by id, sets `aria-invalid`, and focuses the first invalid field when a submit fails.

Any kit input works inside `FormField`: Input, Textarea, NumberInput, PasswordInput, TagInput, ColorPicker, the date and time pickers. For inputs that label themselves (Checkbox, Switch) or need a custom value, use `render`:

```tsx
<FormField name="terms" label="Terms" bare render={(f) => <Checkbox label="I agree" checked={!!f.value} onChange={f.onChange} />} />
```

## Longer forms

- `FormSection` groups fields under a title, beside them (settings pages) or above them.
- `Wizard` splits a form into steps. Each step lists the fields it checks before moving on; the last step submits.
- `FileUpload` collects files, or uploads them as they're added when you pass an `upload` function.

See them live in the UI Kit (`/ui/form`, `/ui/wizard`, `/ui/file-upload`) and in the profile, billing and invite blocks.
