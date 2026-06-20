import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { Alert, Badge, Button, Form, FormError, FormField, Input, PasswordInput, PinInput, useZodForm } from '../../components/kit';
import { api } from '../../lib/api';
import { AuthError, useAuth } from '../../lib/auth';
import { config, DEMO_LOGIN } from '../../lib/config';
import { useAuthOptions } from '../../lib/queries';
import { AuthHeader, AuthLayout } from './AuthLayout';
import { DemoEmail } from './DemoEmail';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export default function Login() {
  const { login } = useAuth();
  const options = useAuthOptions();
  const notice = (useLocation().state as { notice?: string } | null)?.notice;
  const [challenge, setChallenge] = useState<string | null>(null);
  const [unverified, setUnverified] = useState<string | null>(null);
  const [resent, setResent] = useState(0);
  const form = useZodForm(schema, { defaultValues: config.demo ? { ...DEMO_LOGIN } : { email: '', password: '' } });

  const submit = async (v: z.output<typeof schema>) => {
    setUnverified(null);
    try {
      const step = await login(v.email, v.password);
      if (step.status === 'two-factor') setChallenge(step.challengeToken);
    } catch (err) {
      if (err instanceof AuthError && err.code === 'EMAIL_NOT_VERIFIED') {
        setUnverified(v.email);
        return;
      }
      throw err;
    }
  };

  const resend = async () => {
    if (!unverified) return;
    await api.post('/auth/resend-verification', { email: unverified });
    setResent((n) => n + 1);
  };

  if (challenge) return <TwoStep challengeToken={challenge} onBack={() => setChallenge(null)} />;

  return (
    <AuthLayout>
      <AuthHeader
        eyebrow={
          <Badge tone="gold">
            <KeyRound size={12} /> Secure sign in
          </Badge>
        }
        title="Welcome back"
      >
        Sign in to your {config.appName} workspace.
      </AuthHeader>

      <Form form={form} aria-label="Sign in" onSubmit={submit}>
        {notice && <Alert tone="success">{notice}</Alert>}
        <FormError />
        {unverified && (
          <Alert
            tone="warning"
            title="Confirm your email first"
            action={
              <Button size="sm" onClick={() => void resend()}>
                {resent ? 'Sent again' : 'Send the link again'}
              </Button>
            }
          >
            We sent a link to {unverified} when you signed up.
          </Alert>
        )}
        {unverified && <DemoEmail to={unverified} subject="Confirm your email address" refresh={resent} />}
        <FormField name="email" label="Email">
          <Input type="email" autoComplete="username" placeholder="you@company.com" prefix={<Mail size={16} />} autoFocus size="lg" />
        </FormField>
        <FormField
          name="password"
          label="Password"
          labelAside={
            <Link to="/forgot-password" className="link-sm">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput autoComplete="current-password" placeholder="Your password" prefix={<Lock size={16} />} size="lg" />
        </FormField>
        <Button type="submit" variant="primary" size="lg" fullWidth loading={form.formState.isSubmitting} loadingText="Signing in…">
          Sign in
        </Button>
      </Form>

      {options.data?.registrationEnabled && (
        <p className="auth-alt">
          New here? <Link to="/register">Create an account</Link>
        </p>
      )}

      {config.demo && (
        <div className="demo-box">
          <b>Demo mode.</b> No server needed: everything runs on sample data.
          <br />
          Sign in with <code>{DEMO_LOGIN.email}</code> / <code>{DEMO_LOGIN.password}</code>, any sample user with <code>Password123!</code>,
          or create an account.
        </div>
      )}
    </AuthLayout>
  );
}

/* ── Second step ── */

function TwoStep({ challengeToken, onBack }: { challengeToken: string; onBack: () => void }) {
  const { completeTwoFactor } = useAuth();
  const [recovery, setRecovery] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(false);

  const verify = async (value: string) => {
    if (!value.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await completeTwoFactor(challengeToken, value);
    } catch (err) {
      if (err instanceof AuthError && err.code === 'CHALLENGE_EXPIRED') setExpired(true);
      setError(err instanceof Error ? err.message : 'That code didn’t work');
      setCode('');
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      art={{ title: 'One more step.', text: 'Your account is protected by two-step sign-in, so a stolen password alone isn’t enough.' }}
    >
      <AuthHeader
        eyebrow={
          <Badge tone="ok">
            <ShieldCheck size={12} /> Two-step sign-in
          </Badge>
        }
        title={recovery ? 'Use a recovery code' : 'Enter your code'}
      >
        {recovery
          ? 'Type one of the recovery codes you saved when you set up two-step sign-in. Each works once.'
          : 'Open your authenticator app and enter the six-digit code for this account.'}
      </AuthHeader>
      <form
        className="kform auth-form"
        aria-label="Two-step code"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void verify(code);
        }}
      >
        {error && (
          <Alert tone="danger" title={expired ? 'Sign-in timed out' : undefined}>
            {error}
          </Alert>
        )}
        {expired ? (
          <Button variant="primary" size="lg" fullWidth onClick={onBack}>
            Sign in again
          </Button>
        ) : (
          <>
            {recovery ? (
              <Input
                aria-label="Recovery code"
                placeholder="XXXX-XXXX"
                autoComplete="off"
                autoFocus
                size="lg"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                invalid={!!error}
                className="mono"
              />
            ) : (
              <div className="auth-pin">
                <PinInput
                  length={6}
                  groupAfter={3}
                  autoFocus
                  value={code}
                  onChange={setCode}
                  onComplete={(v) => void verify(v)}
                  invalid={!!error}
                  disabled={busy}
                  aria-label="Six-digit code"
                />
              </div>
            )}
            <Button type="submit" variant="primary" size="lg" fullWidth loading={busy} loadingText="Checking…" disabled={!code.trim()}>
              Verify and sign in
            </Button>
            <button
              type="button"
              className="link link-sm"
              onClick={() => {
                setRecovery((r) => !r);
                setCode('');
                setError('');
              }}
            >
              {recovery ? 'Use a code from the app instead' : 'Lost your phone? Use a recovery code'}
            </button>
          </>
        )}
      </form>
      <p className="auth-alt">
        <button type="button" className="link" onClick={onBack}>
          <ArrowLeft size={14} className="flip-rtl" /> Back to sign in
        </button>
      </p>
      {config.demo && !recovery && (
        <div className="demo-box">
          <b>Demo mode.</b> Any six digits work, except <code>000000</code>, which shows the error state.
        </div>
      )}
    </AuthLayout>
  );
}
