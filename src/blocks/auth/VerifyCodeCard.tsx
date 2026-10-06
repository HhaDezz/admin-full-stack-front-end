/**
 * Code check: six boxes that submit as the last digit goes in, with a resend timer.
 * Uses: PinInput, Button, Alert. Use for two-step sign-in, phone or email confirmation.
 */
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Alert, Button, PinInput, useToast } from '@/components/kit';

export default function VerifyCodeCard() {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [wait, setWait] = useState(30);
  useEffect(() => {
    if (!wait) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);
  return (
    <div className="card blk-auth blk-center">
      <span className="blk-auth-icon" aria-hidden="true">
        <ShieldCheck size={22} />
      </span>
      <h2 className="blk-h2">Check your phone</h2>
      <p className="muted">We sent a 6-digit code to •••• 4821. Try 000000 to see the error.</p>
      {error && <Alert tone="danger">{error}</Alert>}
      <PinInput
        value={code}
        groupAfter={3}
        invalid={!!error}
        autoFocus={false}
        onChange={(v) => {
          setCode(v);
          setError('');
        }}
        onComplete={(v) => (v === '000000' ? setError('That code didn’t work. Check it and try again.') : toast.ok('Verified'))}
      />
      <Button
        variant="link"
        disabled={wait > 0}
        onClick={() => {
          setWait(30);
          toast.info('New code sent');
        }}
      >
        {wait ? `Send a new code in ${wait}s` : 'Send a new code'}
      </Button>
    </div>
  );
}
