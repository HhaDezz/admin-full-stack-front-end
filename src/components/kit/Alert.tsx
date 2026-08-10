import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from './utils';
import type { Tone } from './types';
import { TONE_ICON } from './_feedback';

/* ── Alert ── */

export interface AlertProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  /** Replace the tone's icon, or pass `false` for none. */
  icon?: ReactNode | false;
  /** Buttons or links on the right (or below on narrow screens). */
  action?: ReactNode;
  /** Shows a close button. */
  onDismiss?: () => void;
  variant?: 'soft' | 'outline' | 'solid';
  className?: string;
}

export function Alert({ tone = 'info', title, children, icon, action, onDismiss, variant = 'soft', className }: AlertProps) {
  const Icon = TONE_ICON[tone];
  const urgent = tone === 'danger' || tone === 'warning';
  return (
    <div className={cx('alert', `tone-${tone}`, `alert-${variant}`, className)} role={urgent ? 'alert' : 'status'}>
      {icon !== false && <span className="alert-icon">{icon ?? <Icon size={18} />}</span>}
      <div className="alert-body">
        {title && <div className="alert-title">{title}</div>}
        {children && <div className="alert-text">{children}</div>}
      </div>
      {action && <div className="alert-action">{action}</div>}
      {onDismiss && (
        <button className="alert-close" onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/** Older name kept for existing screens: a compact warning / danger alert. */
export function Notice({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <Alert tone={danger ? 'danger' : 'warning'} className="notice-compat">
      {children}
    </Alert>
  );
}
