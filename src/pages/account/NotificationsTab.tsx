import { useQueryClient } from '@tanstack/react-query';
import { Bell, Mail } from 'lucide-react';
import { z } from 'zod';
import { Button, Card, Form, FormActions, FormError, FormField, Skeleton, Switch, useToast, useZodForm } from '../../components/kit';
import { api, unwrap } from '../../lib/api';
import { keys, useNotificationSettings } from '../../lib/queries';
import type { NotificationSettings } from '../../lib/types';

const channels = z.object({ inApp: z.boolean(), email: z.boolean() });
const schema = z.object({ security: channels, account: channels, product: channels });

const ROWS: { key: keyof NotificationSettings; title: string; text: string }[] = [
  { key: 'security', title: 'Security', text: 'New sign-ins from a new browser, password and two-step changes, used recovery codes.' },
  { key: 'account', title: 'Your account', text: 'Changes an administrator makes to your roles or access.' },
  { key: 'product', title: 'News and tips', text: 'New features and occasional tips. Never more than a few a month.' },
];

export default function NotificationsTab() {
  const settings = useNotificationSettings();
  if (!settings.data)
    return (
      <Card padding="lg">
        <Skeleton h={220} />
      </Card>
    );
  return <SettingsForm initial={settings.data} />;
}

function SettingsForm({ initial }: { initial: NotificationSettings }) {
  const qc = useQueryClient();
  const toast = useToast();
  const form = useZodForm(schema, { defaultValues: initial });
  return (
    <Card padding="lg">
      <Form
        form={form}
        guard
        aria-label="Notification settings"
        onSubmit={async (v) => {
          const saved = await unwrap<NotificationSettings>(api.put('/me/notification-settings', v));
          qc.setQueryData(keys.notificationSettings, saved);
          toast.ok('Notification settings saved');
        }}
      >
        <FormError />
        <div className="notif-matrix" role="table" aria-label="Where each kind of notification goes">
          <div className="notif-row is-head" role="row">
            <span role="columnheader">Notification</span>
            <span role="columnheader">
              <Bell size={14} /> In the app
            </span>
            <span role="columnheader">
              <Mail size={14} /> By email
            </span>
          </div>
          {ROWS.map((r) => (
            <div className="notif-row" role="row" key={r.key}>
              <span role="rowheader" className="notif-what">
                <b>{r.title}</b>
                <small>{r.text}</small>
              </span>
              {(['inApp', 'email'] as const).map((ch) => (
                <span role="cell" key={ch}>
                  <FormField
                    name={`${r.key}.${ch}`}
                    label={`${r.title} ${ch === 'inApp' ? 'in the app' : 'by email'}`}
                    valueProp="checked"
                    bare
                  >
                    <Switch
                      checked={false}
                      onChange={() => {}}
                      hideLabel
                      label={`${r.title} ${ch === 'inApp' ? 'in the app' : 'by email'}`}
                    />
                  </FormField>
                </span>
              ))}
            </div>
          ))}
        </div>
        <FormActions>
          <Button onClick={() => form.reset()} disabled={!form.formState.isDirty}>
            Discard
          </Button>
          <Button type="submit" variant="primary" loading={form.formState.isSubmitting} disabled={!form.formState.isDirty}>
            Save
          </Button>
        </FormActions>
      </Form>
    </Card>
  );
}
