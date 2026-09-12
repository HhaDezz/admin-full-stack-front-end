import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { z } from 'zod';
import { Avatar, Button, Form, FormError, FormField, PasswordInput, useZodForm } from '../../components/kit';
import { useAuth } from '../../lib/auth';
import { config, DEMO_LOGIN } from '../../lib/config';
import { AuthLayout } from './AuthLayout';

const schema = z.object({ password: z.string().min(1, 'Enter your password') });

/** Shown after a period of inactivity (or from the user menu). The session stays; the password unlocks it. */
export default function LockScreen() {
  const { session, unlock, logout } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const form = useZodForm(schema, { defaultValues: { password: '' } });
  const name = session?.name || session?.email || 'You';

  return (
    <AuthLayout art={{ title: 'Locked while you were away.', text: 'Your work is where you left it. Enter your password to carry on.' }}>
      <div className="lock-who">
        <Avatar name={name} size={72} />
        <h1>{name}</h1>
        <p className="muted">{session?.email}</p>
      </div>
      <Form
        form={form}
        aria-label="Unlock"
        onSubmit={async (v) => {
          await unlock(v.password);
          navigate(from, { replace: true });
        }}
      >
        <FormError />
        <FormField name="password" label="Password">
          <PasswordInput autoComplete="current-password" autoFocus size="lg" />
        </FormField>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          iconStart={<Lock size={16} />}
          loading={form.formState.isSubmitting}
          loadingText="Unlocking…"
        >
          Unlock
        </Button>
      </Form>
      <p className="auth-alt">
        Not {session?.name?.split(' ')[0] ?? 'you'}?{' '}
        <button type="button" className="link" onClick={() => void logout()}>
          Sign out
        </button>
      </p>
      {config.demo && session?.email === DEMO_LOGIN.email && (
        <div className="demo-box">
          <b>Demo mode.</b> The password is <code>{DEMO_LOGIN.password}</code>.
        </div>
      )}
    </AuthLayout>
  );
}
