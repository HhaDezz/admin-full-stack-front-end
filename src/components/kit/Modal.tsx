import { type ReactNode, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { X } from 'lucide-react';
import { duration, easing } from '../../lib/motion';
import { useFocusTrap, useOverlayLayer } from './utils';
import { panelMotion } from './_overlay';

/* ── Modal ── */

export interface ModalProps {
  title: string;
  /** Short line under the title. */
  subtitle?: ReactNode;
  /** Icon shown in a tinted tile beside the title. */
  icon?: ReactNode;
  tone?: 'brand' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Prevent closing by Escape / backdrop (e.g. while saving). */
  locked?: boolean;
  /**
   * Optional. Pass it to keep the modal mounted and animate it out on close;
   * otherwise render the modal conditionally (`{open && <Modal …/>}`).
   */
  open?: boolean;
}

function ModalPanel({ title, subtitle, icon, tone = 'brand', size = 'md', onClose, children, footer, locked }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useOverlayLayer(true, locked ? undefined : onClose);
  useFocusTrap(panel, true);
  // Render at <body> level so the overlay always covers the whole window,
  // whatever transforms or stacking contexts the page content uses.
  return createPortal(
    <m.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: duration.fast } }}
      exit={{ opacity: 0, transition: { duration: duration.fast } }}
      onMouseDown={(e) => e.target === e.currentTarget && !locked && onClose()}
    >
      <m.div
        ref={panel}
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? descId : undefined}
        tabIndex={-1}
        variants={{
          hidden: { opacity: 0, y: 10, scale: 0.98 },
          show: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.base, ease: easing.enter } },
          exit: { opacity: 0, y: 6, scale: 0.99, transition: { duration: duration.fast, ease: easing.exit } },
        }}
        {...panelMotion}
      >
        <div className="ov-head">
          {icon && <div className={`ov-icon tone-${tone}`}>{icon}</div>}
          <div className="ov-title">
            <h3 id={titleId}>{title}</h3>
            {subtitle && <p id={descId}>{subtitle}</p>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} disabled={locked} aria-label="Close" data-skip-focus="true">
            <X size={18} />
          </button>
        </div>
        <div className="ov-body">{children}</div>
        {footer && <div className="ov-foot">{footer}</div>}
      </m.div>
    </m.div>,
    document.body,
  );
}

export function Modal(props: ModalProps) {
  if (props.open === undefined) return <ModalPanel {...props} />;
  return <AnimatePresence>{props.open && <ModalPanel {...props} />}</AnimatePresence>;
}
