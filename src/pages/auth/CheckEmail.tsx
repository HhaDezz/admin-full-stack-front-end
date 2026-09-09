import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Button } from '../../components/kit';
import { api } from '../../lib/api';
import { AuthHeader } from './AuthLayout';
import { DemoEmail } from './DemoEmail';

/** "We sent you a link" with a resend button (after a short wait, so it can't be hammered). */
export function CheckEmail({
  email,
  subject,
  resendPath,
  children,
}: {
  email: string;
  subject: string;
  resendPath: string;
  children?: React.ReactNode;
}) {
  const [wait, setWait] = useState(30);
  const [sent, setSent] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);
  return (
    <>
      <div className="auth-icon" aria-hidden="true">
        <MailCheck size={26} />
      </div>
      <AuthHeader title="Check your email">
        We sent a link to <b>{email}</b>. It can take a minute to arrive; check your spam folder too.
      </AuthHeader>
      {children}
      <DemoEmail to={email} subject={subject} refresh={sent} />
      <div className="auth-actions">
        <Button
          fullWidth
          loading={busy}
          disabled={wait > 0}
          onClick={async () => {
            setBusy(true);
            try {
              await api.post(resendPath, { email });
            } finally {
              setBusy(false);
              setSent((n) => n + 1);
              setWait(60);
            }
          }}
        >
          {wait > 0 ? `Send again in ${wait}s` : sent ? 'Sent. Send again' : 'Send the link again'}
        </Button>
        <p className="auth-alt" role="status" aria-live="polite">
          {sent > 0 ? 'A new link is on its way. Only the newest link works.' : ''}
        </p>
        <p className="auth-alt">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </>
  );
}
