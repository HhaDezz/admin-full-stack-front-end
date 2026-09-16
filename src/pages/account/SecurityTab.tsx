import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Laptop, Lock, LogOut, MailCheck, MonitorSmartphone, ShieldCheck, ShieldOff, Smartphone, Tablet } from 'lucide-react';
import { z } from 'zod';
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Form,
  FormError,
  FormField,
  List,
  Modal,
  PasswordInput,
  SearchSelect,
  Skeleton,
  useToast,
  useZodForm,
} from '../../components/kit';
import { useStoredState } from '../../components/kit/utils';
import { api, errorMessage, unwrap } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { dateTime, relativeTime } from '../../lib/format';
import { keys, useDeviceSessions, useSecurityOverview } from '../../lib/queries';
import type { DeviceSession, Session } from '../../lib/types';
import { PasswordConfirm } from './PasswordConfirm';
import { RecoveryCodes } from './RecoveryCodes';
import { TwoFactorSetup } from './TwoFactorSetup';

import { LOCK_AFTER_KEY } from '../../components/useIdleLock';

const deviceIcon = (d: DeviceSession['device']) =>
  d === 'phone' ? <Smartphone size={18} /> : d === 'tablet' ? <Tablet size={18} /> : <Laptop size={18} />;

export default function SecurityTab() {
  const { session, updateSession, lock } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const overview = useSecurityOverview();
  const devices = useDeviceSessions();
  const [modal, setModal] = useState<null | 'password' | 'setup' | 'disable' | 'codes' | 'signout-all'>(null);
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const [lockAfter, setLockAfter] = useStoredState<number>(LOCK_AFTER_KEY, 15);
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: keys.security });
    void qc.invalidateQueries({ queryKey: keys.sessions });
    void qc.invalidateQueries({ queryKey: ['me', 'notifications'] });
  };
  const revoke = useMutation({
    mutationFn: (id: string) => api.delete(`/me/sessions/${id}`),
    onSuccess: () => {
      toast.ok('Device signed out');
      refresh();
    },
    onError: (e) => toast.err(errorMessage(e)),
  });
  const revokeAll = useMutation({
    mutationFn: () => unwrap<{ revoked: number }>(api.delete('/me/sessions')),
    onSuccess: (r) => {
      toast.ok(r.revoked ? `Signed out ${r.revoked} other device${r.revoked === 1 ? '' : 's'}` : 'No other devices were signed in');
      setModal(null);
      refresh();
    },
    onError: (e) => toast.err(errorMessage(e)),
  });
  const o = overview.data;
  const others = (devices.data ?? []).filter((d) => !d.current).length;

  return (
    <div className="settings-stack">
      {o && !o.emailVerified && (
        <Alert tone="warning" title="Confirm your email">
          Password resets and security alerts go to {session?.email}. Use the link we sent you to confirm it.
        </Alert>
      )}

      <div className="security-cards">
        <Card padding="lg">
          <div className="sec-row">
            <span className="sec-ico">
              <KeyRound size={20} />
            </span>
            <div className="sec-text">
              <h2>Password</h2>
              <p className="muted">
                {o?.passwordChangedAt ? `Changed ${relativeTime(o.passwordChangedAt)}` : 'Use a long password you don’t use anywhere else.'}
              </p>
            </div>
            <Button onClick={() => setModal('password')}>Change</Button>
          </div>
        </Card>

        <Card padding="lg">
          <div className="sec-row">
            <span className={`sec-ico ${o?.twoFactorEnabled ? 'is-on' : ''}`}>
              {o?.twoFactorEnabled ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
            </span>
            <div className="sec-text">
              <h2>
                Two-step sign-in{' '}
                {overview.isLoading ? null : o?.twoFactorEnabled ? (
                  <Badge tone="ok" dot>
                    On
                  </Badge>
                ) : (
                  <Badge tone="warn" dot>
                    Off
                  </Badge>
                )}
              </h2>
              <p className="muted">
                {o?.twoFactorEnabled
                  ? `A code from your authenticator app is needed to sign in. ${o.recoveryCodesLeft} recovery code${o.recoveryCodesLeft === 1 ? '' : 's'} left.`
                  : 'Ask for a code from an authenticator app when you sign in, so a stolen password isn’t enough.'}
              </p>
            </div>
            {o?.twoFactorEnabled ? (
              <div className="sec-actions">
                <Button onClick={() => setModal('codes')}>New recovery codes</Button>
                <Button variant="ghost" onClick={() => setModal('disable')}>
                  Turn off
                </Button>
              </div>
            ) : (
              <Button variant="primary" onClick={() => setModal('setup')} disabled={!o}>
                Turn on
              </Button>
            )}
          </div>
          {o?.twoFactorEnabled && o.recoveryCodesLeft <= 3 && (
            <Alert tone="warning" variant="outline">
              Only {o.recoveryCodesLeft} recovery code{o.recoveryCodesLeft === 1 ? '' : 's'} left. Create new ones so you can’t get locked
              out.
            </Alert>
          )}
        </Card>

        <Card padding="lg">
          <div className="sec-row">
            <span className={`sec-ico ${o?.emailVerified ? 'is-on' : ''}`}>
              <MailCheck size={20} />
            </span>
            <div className="sec-text">
              <h2>Email</h2>
              <p className="muted">
                {session?.email} {o && (o.emailVerified ? <Badge tone="ok">Confirmed</Badge> : <Badge tone="warn">Not confirmed</Badge>)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title={
          <span className="title-ico">
            <MonitorSmartphone size={18} /> Devices
          </span>
        }
        description="Everywhere you’re signed in. Sign out anything you don’t recognise, then change your password."
        actions={
          others > 0 && (
            <Button size="sm" variant="danger" iconStart={<LogOut size={14} />} onClick={() => setModal('signout-all')}>
              Sign out all others
            </Button>
          )
        }
        padding="none"
      >
        {devices.isLoading ? (
          <div style={{ padding: 16, display: 'grid', gap: 10 }}>
            <Skeleton h={48} />
            <Skeleton h={48} />
          </div>
        ) : (
          <List
            variant="plain"
            aria-label="Signed-in devices"
            items={(devices.data ?? []).map((d) => ({
              id: d.id,
              leading: <span className="device-ico">{deviceIcon(d.device)}</span>,
              title: (
                <>
                  {d.browser} on {d.os} {d.current && <Badge tone="ok">This device</Badge>}
                </>
              ),
              description: `${d.ipAddress ?? 'Unknown IP'} · ${d.current ? 'Active now' : `Last active ${relativeTime(d.lastSeenAt)}`} · Signed in ${dateTime(d.createdAt)}`,
              actions: d.current ? undefined : (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={revoke.isPending && revoke.variables === d.id}
                  onClick={() => revoke.mutate(d.id)}
                  aria-label={`Sign out ${d.browser} on ${d.os}`}
                >
                  Sign out
                </Button>
              ),
            }))}
          />
        )}
      </Card>

      <Card
        title="Lock screen"
        description="Hide the app after a while without activity. Your work stays where it is; your password unlocks it."
      >
        <div className="lock-row">
          <SearchSelect
            aria-label="Lock automatically after"
            searchable={false}
            minWidth={200}
            value={lockAfter}
            onChange={(v) => v != null && setLockAfter(v)}
            options={[
              { value: 0, label: 'Never' },
              { value: 5, label: 'After 5 minutes' },
              { value: 15, label: 'After 15 minutes' },
              { value: 30, label: 'After 30 minutes' },
              { value: 60, label: 'After 1 hour' },
            ]}
          />
          <Button iconStart={<Lock size={15} />} onClick={lock}>
            Lock now
          </Button>
        </div>
      </Card>

      {modal === 'password' && (
        <ChangePassword
          onClose={() => setModal(null)}
          onDone={(s) => {
            updateSession(s);
            setModal(null);
            toast.ok('Password changed', 'Your other devices were signed out.');
            refresh();
          }}
        />
      )}
      {modal === 'setup' && (
        <TwoFactorSetup
          email={session?.email ?? ''}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            updateSession({ twoFactorEnabled: true });
            toast.ok('Two-step sign-in is on');
            refresh();
          }}
        />
      )}
      {modal === 'disable' && (
        <PasswordConfirm
          title="Turn off two-step sign-in?"
          description="Your password alone will be enough to sign in."
          confirmLabel="Turn off"
          danger
          onClose={() => setModal(null)}
          onConfirm={async (password) => {
            await api.post('/me/2fa/disable', { password });
            setModal(null);
            updateSession({ twoFactorEnabled: false });
            toast.ok('Two-step sign-in is off');
            refresh();
          }}
        />
      )}
      {modal === 'codes' && !newCodes && (
        <PasswordConfirm
          title="Create new recovery codes?"
          description="Your old codes stop working straight away."
          confirmLabel="Create new codes"
          onClose={() => setModal(null)}
          onConfirm={async (password) => {
            const r = await unwrap<{ codes: string[] }>(api.post('/me/2fa/recovery-codes', { password }));
            setNewCodes(r.codes);
            refresh();
          }}
        />
      )}
      {newCodes && (
        <Modal
          title="Your new recovery codes"
          icon={<ShieldCheck size={20} />}
          onClose={() => {
            setNewCodes(null);
            setModal(null);
          }}
          footer={
            <Button
              variant="primary"
              onClick={() => {
                setNewCodes(null);
                setModal(null);
              }}
            >
              I’ve saved them
            </Button>
          }
        >
          <RecoveryCodes codes={newCodes} email={session?.email} />
        </Modal>
      )}
      <ConfirmDialog
        open={modal === 'signout-all'}
        title="Sign out all other devices?"
        message={`${others} other device${others === 1 ? '' : 's'} will need to sign in again. This one stays signed in.`}
        confirmLabel="Sign out others"
        busy={revokeAll.isPending}
        onConfirm={() => revokeAll.mutate()}
        onClose={() => setModal(null)}
      />
    </div>
  );
}

const pwSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters').max(72, 'Use at most 72 characters'),
    confirm: z.string().min(1, 'Type the new password again'),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: 'The passwords don’t match' });

function ChangePassword({ onClose, onDone }: { onClose: () => void; onDone: (s: Partial<Session>) => void }) {
  const form = useZodForm(pwSchema, { defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });
  const busy = form.formState.isSubmitting;
  return (
    <Modal
      title="Change password"
      subtitle="Every other device will be signed out."
      icon={<KeyRound size={20} />}
      locked={busy}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="change-pw" variant="primary" loading={busy}>
            Change password
          </Button>
        </>
      }
    >
      <Form
        form={form}
        id="change-pw"
        onSubmit={async (v) => {
          const s = await unwrap<Partial<Session>>(
            api.put('/me/password', { currentPassword: v.currentPassword, newPassword: v.newPassword }),
          );
          onDone(s);
        }}
      >
        <FormError />
        <FormField name="currentPassword" label="Current password">
          <PasswordInput autoComplete="current-password" autoFocus />
        </FormField>
        <FormField name="newPassword" label="New password">
          <PasswordInput autoComplete="new-password" strength />
        </FormField>
        <FormField name="confirm" label="Confirm new password">
          <PasswordInput autoComplete="new-password" />
        </FormField>
      </Form>
    </Modal>
  );
}
