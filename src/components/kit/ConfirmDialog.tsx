import type { ReactNode } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { Spinner } from './Spinner';
import { cx } from './utils';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` (default) shows a red button and warning icon. */
  tone?: 'danger' | 'brand';
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  open?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy,
  onConfirm,
  onClose,
  open,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      icon={tone === 'danger' ? <AlertTriangle size={20} /> : <Check size={20} />}
      tone={tone}
      size="sm"
      locked={busy}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            className={cx('btn', tone === 'danger' ? 'btn-danger' : 'btn-primary')}
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy || undefined}
          >
            {busy && <Spinner label={null} />} {confirmLabel ?? (tone === 'danger' ? 'Delete' : 'Confirm')}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--ink-2)' }}>{message}</p>
    </Modal>
  );
}
