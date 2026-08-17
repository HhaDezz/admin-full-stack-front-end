import { type ReactNode, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { X } from 'lucide-react';
import { duration, easing } from '../../lib/motion';
import { useFocusTrap, useOverlayLayer } from './utils';

/* ── Drawer ── */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  side?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
  locked?: boolean;
}

const DRAWER_FROM = { right: { x: '100%' }, left: { x: '-100%' }, bottom: { y: '100%' } } as const;

function DrawerPanel({ onClose, title, subtitle, side = 'right', size = 'md', children, footer, locked }: DrawerProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayLayer(true, locked ? undefined : onClose);
  useFocusTrap(panel, true);
  const from = DRAWER_FROM[side];
  return createPortal(
    <div className="drawer-root">
      <m.div
        className="drawer-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: duration.base } }}
        exit={{ opacity: 0, transition: { duration: duration.fast } }}
        onMouseDown={() => !locked && onClose()}
      />
      <m.div
        ref={panel}
        className={`drawer drawer-${side} drawer-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={from}
        animate={{ x: 0, y: 0, transition: { duration: duration.slow, ease: easing.enter } }}
        exit={{ ...from, transition: { duration: duration.base, ease: easing.exit } }}
      >
        <div className="ov-head">
          <div className="ov-title">
            <h3 id={titleId}>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} disabled={locked} aria-label="Close" data-skip-focus="true">
            <X size={18} />
          </button>
        </div>
        <div className="ov-body drawer-body">{children}</div>
        {footer && <div className="ov-foot">{footer}</div>}
      </m.div>
    </div>,
    document.body,
  );
}

export function Drawer(props: DrawerProps) {
  return <AnimatePresence>{props.open && <DrawerPanel {...props} />}</AnimatePresence>;
}
