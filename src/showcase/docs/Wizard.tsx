import { z } from 'zod';
import { Button, Form, FormField, Input, RadioCards, Switch, TagInput, Wizard, useToast, useZodForm } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './Wizard.tsx?raw';

// #region onboarding
const schema = z.object({
  company: z.string().trim().min(2, 'Enter your company name'),
  size: z.string().min(1, 'Choose a size'),
  invites: z.array(z.email('Enter valid email addresses')).min(1, 'Invite at least one person'),
  digest: z.boolean(),
});

export function Onboarding() {
  const toast = useToast();
  const form = useZodForm(schema, { defaultValues: { company: '', size: '', invites: [], digest: true } });
  return (
    <Form
      form={form}
      aria-label="Set up workspace"
      onSubmit={async (v) => {
        await new Promise((r) => setTimeout(r, 600));
        toast.ok(`${v.company} is ready`);
        form.reset();
      }}
    >
      <Wizard
        finishLabel="Create workspace"
        busy={form.formState.isSubmitting}
        steps={[
          {
            id: 'company',
            title: 'Company',
            description: 'Name and size',
            fields: ['company', 'size'],
            content: (
              <>
                <FormField name="company" label="Company name">
                  <Input />
                </FormField>
                <FormField name="size" label="Team size">
                  <RadioCards
                    minCardWidth={120}
                    options={[
                      { value: '1-10', label: '1–10' },
                      { value: '11-50', label: '11–50' },
                      { value: '51+', label: '51+' },
                    ]}
                  />
                </FormField>
              </>
            ),
          },
          {
            id: 'team',
            title: 'Team',
            description: 'Invite people',
            fields: ['invites'],
            content: (
              <FormField name="invites" label="Email addresses" hint="Press Enter after each one.">
                <TagInput placeholder="name@company.com" />
              </FormField>
            ),
          },
          {
            id: 'done',
            title: 'Finish',
            description: 'Preferences',
            content: (
              <FormField
                name="digest"
                label="Weekly digest"
                bare
                render={(f) => <Switch label="Email me a weekly summary" checked={f.value} onChange={f.onChange} />}
              />
            ),
          },
        ]}
      />
    </Form>
  );
}
// #endregion

// #region plain
export function Plain() {
  const toast = useToast();
  return (
    <Wizard
      onFinish={() => void toast.ok('Done')}
      steps={[
        { id: 'read', title: 'Read', content: <p>Wizards work without a form too: onFinish runs on the last step.</p> },
        { id: 'check', title: 'Check', content: <p>Steps you’ve finished can be clicked to go back.</p> },
        {
          id: 'go',
          title: 'Go',
          content: (
            <p>
              <Button size="sm" variant="ghost" onClick={() => toast.info('Extra buttons can live in a step.')}>
                Any content
              </Button>
            </p>
          ),
        },
      ]}
    />
  );
}
// #endregion

export default defineDoc({
  name: 'Wizard',
  group: 'Forms',
  status: 'new',
  description:
    'A multi-step form: a Steps header, sliding panels and Back/Next buttons. Each step validates only its own fields before moving on, and the last one submits the form.',
  raw,
  examples: [
    {
      id: 'onboarding',
      title: 'Inside a Form',
      description: 'fields lists what to check before Next. The finish button submits the surrounding Form.',
      Component: Onboarding,
    },
    { id: 'plain', title: 'Without a form', description: 'For guides and setup flows with no inputs.', Component: Plain },
  ],
  keyboard: [
    ['Tab', 'Through the step’s fields, then Back and Next'],
    ['Enter', 'In a field: Next (or finish on the last step)'],
  ],
  a11y: [
    'Each step is a section labelled by its heading, which takes focus when the step changes.',
    'The Steps header marks the current step with aria-current="step".',
    'Invalid fields get focus when Next is refused.',
    'Panels fade instead of sliding when reduced motion is on.',
  ],
  props: [
    {
      name: 'steps',
      type: '{ id, title, description?, fields?, content }[]',
      description: 'The steps; fields are checked before leaving.',
    },
    { name: 'finishLabel', type: 'string', defaultValue: "'Finish'", description: 'Last button.' },
    { name: 'onFinish', type: '() => void | Promise', description: 'Last step, when not inside a Form.' },
    { name: 'step / onStepChange', type: 'number / (i) => void', description: 'Control the current step.' },
    { name: 'busy', type: 'boolean', description: 'Show the finish button as loading.' },
  ],
});
