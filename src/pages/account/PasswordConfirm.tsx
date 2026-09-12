import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { z } from 'zod';
import { Button, Form, FormError, FormField, Modal, PasswordInput, useZodForm } from '../../components/kit';

const schema = z.object({ password: z.string().min(1, 'Enter your password') });

/** Asks for the password before a sensitive change. The action receives it; field errors land on the input. */
export function PasswordConfirm({
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: (password: string) => Promise<void>;
  onClose: () => void;
}) {
  const form = useZodForm(schema, { defaultValues: { password: '' } });
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      title={title}
      subtitle={description}
      icon={<KeyRound size={20} />}
      tone={danger ? 'danger' : 'brand'}
      size="sm"
      locked={busy}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="pw-confirm" variant={danger ? 'danger' : 'primary'} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Form
        form={form}
        id="pw-confirm"
        onSubmit={async (v) => {
          setBusy(true);
          try {
            await onConfirm(v.password);
          } finally {
            setBusy(false);
          }
        }}
      >
        <FormError />
        <FormField name="password" label="Your password">
          <PasswordInput autoComplete="current-password" autoFocus />
        </FormField>
      </Form>
    </Modal>
  );
}
