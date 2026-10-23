import { z } from 'zod';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  FormActions,
  FormError,
  FormField,
  FormSection,
  Input,
  SearchSelect,
  Switch,
  TagInput,
  Textarea,
  useToast,
  useZodForm,
} from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './Form.tsx?raw';

// #region signup
const signup = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Enter a valid email address'),
  role: z.string().min(1, 'Choose a role'),
  terms: z.literal(true, { error: 'Please accept the terms' }),
});

const ROLES = ['Admin', 'Support', 'User'].map((r) => ({ value: r, label: r }));

export function Signup() {
  const toast = useToast();
  const form = useZodForm(signup, { defaultValues: { name: '', email: '', role: '', terms: false as never } });
  return (
    <Form
      form={form}
      aria-label="Invite"
      onSubmit={async (v) => {
        await new Promise((r) => setTimeout(r, 500));
        // Pretend the API refused it: field errors land under their inputs.
        if (v.email.endsWith('@example.com'))
          throw Object.assign(new Error('Check the form'), { fields: { email: 'That email is already in use.' } });
        toast.ok(`Invited ${v.name}`);
      }}
    >
      <FormError />
      <FormField name="name" label="Full name" required>
        <Input autoComplete="name" />
      </FormField>
      <FormField name="email" label="Email" required hint="Try anything@example.com for a server error.">
        <Input type="email" autoComplete="email" />
      </FormField>
      <FormField
        name="role"
        label="Role"
        required
        render={(f) => (
          <SearchSelect
            options={ROLES}
            value={f.value || null}
            onChange={(v) => f.onChange(v ?? '')}
            error={f.invalid}
            placeholder="Choose a role"
          />
        )}
      />
      <FormField
        name="terms"
        label="Terms"
        bare
        render={(f) => <Checkbox label="I agree to the terms" checked={!!f.value} onChange={f.onChange} />}
      />
      <FormActions>
        <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
          Send invite
        </Button>
      </FormActions>
    </Form>
  );
}
// #endregion

// #region settings
const settings = z.object({
  company: z.string().trim().min(2, 'At least 2 characters'),
  about: z.string().max(160, 'Keep it under 160 characters'),
  tags: z.array(z.string()).max(5, 'Up to 5 tags'),
  launch: z.date().nullable(),
  public: z.boolean(),
});

export function Settings() {
  const toast = useToast();
  const form = useZodForm(settings, {
    defaultValues: { company: 'Anjana', about: '', tags: ['retail'], launch: null, public: true },
  });
  return (
    <Form form={form} guard aria-label="Workspace settings" onSubmit={async () => toast.ok('Settings saved')}>
      <FormSection title="Workspace" description="Shown on invites and emails.">
        <FormField name="company" label="Company name">
          <Input />
        </FormField>
        <FormField name="about" label="About" hint="Optional, 160 characters.">
          <Textarea rows={3} />
        </FormField>
        <FormField name="tags" label="Tags">
          <TagInput lowercase />
        </FormField>
      </FormSection>
      <FormSection title="Launch" description="Leave the page with unsaved changes and you’ll be asked first.">
        <FormField name="launch" label="Launch date">
          <DatePicker />
        </FormField>
        <FormField
          name="public"
          label="Public"
          bare
          render={(f) => <Switch label="List this workspace publicly" checked={f.value} onChange={f.onChange} />}
        />
      </FormSection>
      <FormActions>
        <Button type="button" variant="ghost" onClick={() => form.reset()} disabled={!form.formState.isDirty}>
          Discard
        </Button>
        <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
          Save
        </Button>
      </FormActions>
    </Form>
  );
}
// #endregion

export default defineDoc({
  name: 'Form',
  group: 'Forms',
  status: 'new',
  description:
    'Schema forms with React Hook Form and Zod: one schema gives types and validation, the API’s field errors land under the right inputs, and guard asks before leaving with unsaved changes.',
  imports: ['Form', 'FormField', 'FormSection', 'FormActions', 'FormError', 'useZodForm'],
  raw,
  examples: [
    {
      id: 'signup',
      title: 'Validation and server errors',
      description:
        'Fields check themselves when they lose focus, then as you type. If onSubmit throws, field errors from the API go under their inputs and anything else into FormError.',
      Component: Signup,
    },
    {
      id: 'settings',
      title: 'Settings with sections and a guard',
      description: 'FormSection puts titles beside the fields. guard warns before an in-app link or closing the tab loses changes.',
      Component: Settings,
    },
  ],
  a11y: [
    'Each FormField gives its input the label, hint and error by id; invalid inputs get aria-invalid.',
    'On a failed submit the first invalid field gets focus.',
    'FormActions announces “Unsaved changes” and “Saved” in a polite live region.',
  ],
  props: [
    {
      title: 'useZodForm(schema, options?)',
      rows: [
        { name: 'schema', type: 'ZodType', description: 'Values are typed from it: z.input before, z.output after parsing.' },
        { name: 'options', type: 'UseFormProps', description: 'defaultValues and the rest of useForm’s options. mode is onTouched.' },
      ],
    },
    {
      title: 'Form',
      rows: [
        { name: 'form', type: 'UseFormReturn', description: 'From useZodForm.' },
        { name: 'onSubmit', type: '(values) => Promise', description: 'Throw to show the API’s errors on the form.' },
        { name: 'guard', type: 'boolean', defaultValue: 'false', description: 'Confirm before leaving with unsaved changes.' },
      ],
    },
    {
      title: 'FormField',
      rows: [
        { name: 'name', type: 'FieldPath', description: 'Typed from the schema.' },
        { name: 'label / hint / required', type: 'ReactNode / boolean', description: 'As on Field.' },
        { name: 'children', type: 'ReactElement', description: 'Any kit input: it gets value, onChange, onBlur, name and ref.' },
        { name: 'valueProp', type: "'value' | 'checked'", defaultValue: "'value'", description: "'checked' for Checkbox and Switch." },
        { name: 'render', type: '(field) => ReactNode', description: 'Full control instead of children.' },
        { name: 'bare', type: 'boolean', description: 'No label row, for inputs that label themselves.' },
      ],
    },
    {
      title: 'FormSection / FormActions / FormError',
      rows: [
        { name: 'FormSection title / description', type: 'ReactNode', description: 'Section heading.' },
        {
          name: 'FormSection layout',
          type: "'side' | 'stacked'",
          defaultValue: "'side'",
          description: 'Title beside or above the fields.',
        },
        { name: 'FormActions sticky', type: 'boolean', description: 'Stick to the bottom of a long form.' },
        { name: 'FormError title', type: 'ReactNode', description: 'Heading for the form-level error.' },
      ],
    },
  ],
  extra: [
    {
      id: 'api-errors',
      title: 'Errors from the API',
      content: (
        <p>
          The back end answers <code>{'{ message, data: { email: "Already in use" } }'}</code>. Form reads that shape from axios errors, so{' '}
          <code>
            onSubmit={'{'}(v) =&gt; api.post('/users', v){'}'}
          </code>{' '}
          needs no try/catch. Call <code>applyServerErrors(form, err)</code> yourself when you submit outside a Form.
        </p>
      ),
    },
  ],
});
