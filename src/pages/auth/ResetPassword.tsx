import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LinkIcon } from 'lucide-react';
import { z } from 'zod';
import { Alert, Button, Form, FormError, FormField, PasswordInput, Skeleton, useZodForm } from '../../components/kit';
import { api, errorMessage } from '../../lib/api';
import { AuthHeader, AuthLayout } from './AuthLayout';

const schema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters').max(72, 'Use at most 72 characters'),
    confirm: z.string().min(1, 'Type the password again'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The passwords don’t match' });

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const check = useQuery({
    queryKey: ['reset-check', token],
    queryFn: () => api.post('/auth/reset-password/check', { token }),
    retry: false,
    enabled: !!token,
  });
  const form = useZodForm(schema, { defaultValues: { password: '', confirm: '' } });
  const invalid = !token || check.isError;

  return (
    <AuthLayout
      art={{ title: 'A fresh start.', text: 'Choose a new password. Every device signed in to your account will be signed out.' }}
    >
      {check.isLoading ? (
        <>
          <Skeleton h={40} w="70%" />
          <Skeleton h={160} />
        </>
      ) : invalid ? (
        <>
          <div className="auth-icon is-warn" aria-hidden="true">
            <LinkIcon size={24} />
          </div>
          <AuthHeader title="This link doesn’t work any more">
            {token
              ? errorMessage(check.error, 'This reset link has expired or was already used.')
              : 'The link is incomplete. Copy the whole link from the email.'}
          </AuthHeader>
          <div className="auth-actions">
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/forgot-password')}>
              Send me a new link
            </Button>
            <p className="auth-alt">
              <Link to="/login">Back to sign in</Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <AuthHeader title="Choose a new password">Use something you don’t use anywhere else.</AuthHeader>
          <Form
            form={form}
            aria-label="New password"
            onSubmit={async (v) => {
              await api.post('/auth/reset-password', { token, password: v.password });
              navigate('/login', { replace: true, state: { notice: 'Password changed. Sign in with your new password.' } });
            }}
          >
            <FormError />
            <Alert tone="info">You’ll be signed out on every device.</Alert>
            <FormField name="password" label="New password">
              <PasswordInput autoComplete="new-password" strength autoFocus size="lg" />
            </FormField>
            <FormField name="confirm" label="Confirm new password">
              <PasswordInput autoComplete="new-password" size="lg" />
            </FormField>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={form.formState.isSubmitting}>
              Change password
            </Button>
          </Form>
        </>
      )}
    </AuthLayout>
  );
}
