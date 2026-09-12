import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { Alert, Button, CopyButton, Modal, PinInput, QrCode, Skeleton, Steps } from '../../components/kit';
import { api, errorMessage, unwrap } from '../../lib/api';
import { config } from '../../lib/config';
import type { TwoFactorSetup as Setup } from '../../lib/types';
import { RecoveryCodes } from './RecoveryCodes';

/** Scan the QR code, confirm with a first code, save the recovery codes. */
export function TwoFactorSetup({ email, onDone, onClose }: { email: string; onDone: () => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [manual, setManual] = useState(false);
  const setup = useMutation({ mutationFn: () => unwrap<Setup>(api.post('/me/2fa/setup')) });
  const enable = useMutation({
    mutationFn: (c: string) => unwrap<{ codes: string[] }>(api.post('/me/2fa/enable', { code: c })),
    onSuccess: (r) => {
      setCodes(r.codes);
      setStep(2);
    },
    onError: () => setCode(''),
  });
  useEffect(() => {
    setup.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const secret = setup.data?.secret ?? '';

  return (
    <Modal
      title="Turn on two-step sign-in"
      subtitle="Use an authenticator app such as 1Password, Google Authenticator or Authy."
      icon={<ShieldCheck size={20} />}
      size="md"
      locked={enable.isPending}
      onClose={step === 2 ? onDone : onClose}
      footer={
        step === 0 ? (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={!setup.data} onClick={() => setStep(1)}>
              I’ve scanned it
            </Button>
          </>
        ) : step === 1 ? (
          <>
            <Button onClick={() => setStep(0)}>Back</Button>
            <Button variant="primary" loading={enable.isPending} disabled={code.length !== 6} onClick={() => enable.mutate(code)}>
              Turn on
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onDone}>
            I’ve saved my codes
          </Button>
        )
      }
    >
      <div className="tfa">
        <Steps items={[{ title: 'Scan' }, { title: 'Confirm' }, { title: 'Save codes' }]} current={step} />
        {setup.isError && <Alert tone="danger">{errorMessage(setup.error)}</Alert>}
        {step === 0 && (
          <div className="tfa-scan">
            {setup.data ? (
              <QrCode value={setup.data.otpauthUrl} size={176} aria-label="QR code to add this account to an authenticator app" />
            ) : (
              <Skeleton h={176} w={176} r={12} />
            )}
            <div className="tfa-scan-text">
              <p>Open your authenticator app, choose “Add account” and scan this code.</p>
              {manual ? (
                <div className="tfa-secret">
                  <span className="muted">Or type this key:</span>
                  <code className="mono">{secret.replace(/(.{4})/g, '$1 ').trim()}</code>
                  <CopyButton value={secret} label="Copy key" />
                </div>
              ) : (
                <button type="button" className="link link-sm" onClick={() => setManual(true)}>
                  Can’t scan? Type a key instead
                </button>
              )}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="tfa-confirm">
            <p>Enter the six-digit code your app shows for {config.appName}.</p>
            {enable.isError && <Alert tone="danger">{errorMessage(enable.error)}</Alert>}
            <PinInput
              length={6}
              groupAfter={3}
              autoFocus
              value={code}
              onChange={setCode}
              onComplete={(v) => enable.mutate(v)}
              invalid={enable.isError}
              aria-label="Six-digit code"
            />
            {config.demo && <p className="muted">Demo mode: any six digits work, except 000000.</p>}
          </div>
        )}
        {step === 2 && <RecoveryCodes codes={codes} email={email} />}
      </div>
    </Modal>
  );
}
