import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { z } from 'zod';
import { Button, Form, FormError, FormField, Input, useZodForm } from '../../components/kit';
import { api } from '../../lib/api';
import { AuthHeader, AuthLayout } from './AuthLayout';
import { CheckEmail } from './CheckEmail';

const schema = z.object({ email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address') });

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useZodForm(schema, { defaultValues: { email: '' } });
  return (
    <AuthLayout
      art={{
        title: 'It happens to everyone.',
        text: 'We’ll email you a link to choose a new password. It works once and expires after an hour.',
      }}
    >
      {sentTo ? (
        <CheckEmail email={sentTo} subject="Reset your password" resendPath="/auth/forgot-password">
          <p className="muted">If there’s an account for this address, the link to reset your password is in your inbox.</p>
        </CheckEmail>
      ) : (
        <>
          <AuthHeader title="Forgot your password?">Enter the email you sign in with and we’ll send you a link to reset it.</AuthHeader>
          <Form
            form={form}
            aria-label="Reset password"
            onSubmit={async (v) => {
              await api.post('/auth/forgot-password', v);
              setSentTo(v.email.trim().toLowerCase());
            }}
          >
            <FormError />
            <FormField name="email" label="Email">
              <Input type="email" autoComplete="email" placeholder="you@company.com" prefix={<Mail size={16} />} autoFocus size="lg" />
            </FormField>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={form.formState.isSubmitting}>
              Send reset link
            </Button>
          </Form>
          <p className="auth-alt">
            <Link to="/login">
              <ArrowLeft size={14} className="flip-rtl" /> Back to sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
