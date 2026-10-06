/**
 * Sign-in card: email and password with validation, "remember me", and a single sign-on button.
 * Uses: Form, FormField, Input, PasswordInput, Checkbox, Button, Divider.
 * The real sign-in page (src/pages/auth/Login.tsx) adds two-step sign-in and error codes.
 */
import { z } from 'zod';
import { KeyRound } from 'lucide-react';
import { Button, Checkbox, Divider, Form, FormError, FormField, Input, PasswordInput, useToast, useZodForm } from '@/components/kit';

const schema = z.object({
  email: z.email('Enter your email address'),
  password: z.string().min(1, 'Enter your password'),
  remember: z.boolean(),
});

export default function SignInCard() {
  const toast = useToast();
  const form = useZodForm(schema, { defaultValues: { email: '', password: '', remember: true } });
  return (
    <div className="card blk-auth">
      <h2 className="blk-h2">Sign in</h2>
      <p className="muted">Welcome back. Use your work email.</p>
      <Form form={form} aria-label="Sign in" onSubmit={async (v) => toast.ok(`Signed in as ${v.email}`)}>
        <FormError />
        <FormField name="email" label="Email">
          <Input type="email" autoComplete="email" placeholder="you@company.com" />
        </FormField>
        <FormField name="password" label="Password" labelAside={<a href="#forgot">Forgot password?</a>}>
          <PasswordInput autoComplete="current-password" />
        </FormField>
        <FormField
          name="remember"
          label="Remember me"
          bare
          render={(f) => <Checkbox label="Keep me signed in for 30 days" checked={!!f.value} onChange={f.onChange} />}
        />
        <Button type="submit" variant="primary" fullWidth loading={form.formState.isSubmitting}>
          Sign in
        </Button>
      </Form>
      <Divider label="or" />
      <Button variant="secondary" fullWidth iconStart={<KeyRound size={16} />}>
        Sign in with SSO
      </Button>
    </div>
  );
}
