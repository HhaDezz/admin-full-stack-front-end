import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CircleCheck, LinkIcon } from 'lucide-react';
import { z } from 'zod';
import { Button, Form, FormError, FormField, Input, Skeleton, useZodForm } from '../../components/kit';
import { api, errorMessage } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { AuthHeader, AuthLayout } from './AuthLayout';
import { CheckEmail } from './CheckEmail';
import { useState } from 'react';

const schema = z.object({ email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address') });

/** Opened from the confirmation email. Confirms on arrival; offers a new link if this one is stale. */
export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { session } = useAuth();
  const verify = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => api.post('/auth/verify-email', { token }),
    retry: false,
    enabled: !!token,
    staleTime: Infinity,
  });
  const [resentTo, setResentTo] = useState<string | null>(null);
  const form = useZodForm(schema, { defaultValues: { email: '' } });

  return (
    <AuthLayout
      art={{
        title: 'Almost there.',
        text: 'Confirming your email keeps your account yours: password resets and security alerts go to this address.',
      }}
    >
      {verify.isLoading ? (
        <>
          <Skeleton h={56} w={56} r={16} />
          <Skeleton h={40} w="70%" />
          <Skeleton h={20} w="90%" />
        </>
      ) : verify.isSuccess ? (
        <>
          <div className="auth-icon is-ok" aria-hidden="true">
            <CircleCheck size={28} />
          </div>
          <AuthHeader title="Email confirmed">Thanks. Your account is ready.</AuthHeader>
          <div className="auth-actions">
            <Link to={session ? '/' : '/login'} className="btn btn-primary btn-lg btn-block">
              {session ? 'Go to the dashboard' : 'Sign in'}
            </Link>
          </div>
        </>
      ) : resentTo ? (
        <CheckEmail email={resentTo} subject="Confirm your email address" resendPath="/auth/resend-verification" />
      ) : (
        <>
          <div className="auth-icon is-warn" aria-hidden="true">
            <LinkIcon size={24} />
          </div>
          <AuthHeader title="This link doesn’t work any more">
            {token ? errorMessage(verify.error, 'This confirmation link has expired or was already used.') : 'The link is incomplete.'}{' '}
            Enter your email and we’ll send a new one.
          </AuthHeader>
          <Form
            form={form}
            aria-label="Send a new confirmation link"
            onSubmit={async (v) => {
              await api.post('/auth/resend-verification', v);
              setResentTo(v.email.trim().toLowerCase());
            }}
          >
            <FormError />
            <FormField name="email" label="Email">
              <Input type="email" autoComplete="email" size="lg" />
            </FormField>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={form.formState.isSubmitting}>
              Send a new link
            </Button>
          </Form>
          <p className="auth-alt">
            <Link to="/login">Back to sign in</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
