import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import { z } from 'zod';
import { Button, Checkbox, Form, FormError, FormField, Input, PasswordInput, Skeleton, useZodForm } from '../../components/kit';
import { api, unwrap } from '../../lib/api';
import { config } from '../../lib/config';
import { useAuthOptions } from '../../lib/queries';
import { AuthHeader, AuthLayout } from './AuthLayout';
import { CheckEmail } from './CheckEmail';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120, 'Name is too long'),
  email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters').max(72, 'Use at most 72 characters'),
  terms: z.boolean().refine((v) => v, 'Please accept the terms to continue'),
});

export default function Register() {
  const options = useAuthOptions();
  const [done, setDone] = useState<{ email: string; verify: boolean } | null>(null);
  const form = useZodForm(schema, { defaultValues: { name: '', email: '', password: '', terms: false } });

  if (options.isLoading)
    return (
      <AuthLayout>
        <Skeleton h={40} w="60%" />
        <Skeleton h={220} />
      </AuthLayout>
    );
  if (options.data && !options.data.registrationEnabled)
    return <Navigate to="/login" replace state={{ notice: 'Sign-up is turned off. Ask an administrator for an account.' }} />;
  if (done && !done.verify) return <Navigate to="/login" replace state={{ notice: 'Account created. You can sign in now.' }} />;

  return (
    <AuthLayout
      art={{
        title: 'Your team, set up in minutes.',
        text: 'Create an account, confirm your email and you’re in. An administrator decides what you can see.',
      }}
    >
      {done ? (
        <CheckEmail email={done.email} subject="Confirm your email address" resendPath="/auth/resend-verification">
          <p className="muted">Click the link to confirm your address, then sign in.</p>
        </CheckEmail>
      ) : (
        <>
          <AuthHeader title="Create your account">
            Already have one? <Link to="/login">Sign in</Link>
          </AuthHeader>
          <Form
            form={form}
            aria-label="Create account"
            onSubmit={async (v) => {
              const r = await unwrap<{ email: string; verificationRequired: boolean }>(
                api.post('/auth/register', { name: v.name, email: v.email, password: v.password }),
              );
              setDone({ email: r.email, verify: r.verificationRequired });
            }}
          >
            <FormError />
            <FormField name="name" label="Full name">
              <Input autoComplete="name" prefix={<User size={16} />} autoFocus size="lg" />
            </FormField>
            <FormField name="email" label="Work email">
              <Input type="email" autoComplete="email" placeholder="you@company.com" prefix={<Mail size={16} />} size="lg" />
            </FormField>
            <FormField name="password" label="Password">
              <PasswordInput autoComplete="new-password" strength size="lg" />
            </FormField>
            <FormField name="terms" label="Terms" valueProp="checked" bare>
              <Checkbox checked={false} onChange={() => {}} label={<>I agree to the terms of service and privacy policy</>} />
            </FormField>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={form.formState.isSubmitting}
              loadingText="Creating account…"
            >
              Create account
            </Button>
          </Form>
          {config.demo && (
            <div className="demo-box">
              <b>Demo mode.</b> The confirmation email appears on the next screen, so you can finish sign-up here.
            </div>
          )}
        </>
      )}
    </AuthLayout>
  );
}
