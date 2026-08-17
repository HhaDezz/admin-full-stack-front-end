import { type CSSProperties, type ReactElement, type ReactNode, useCallback, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { pop } from '../../lib/motion';
import {
  type Align,
  cx,
  originFor,
  type Side,
  useControllable,
  useFloating,
  useFocusTrap,
  useOutsidePress,
  useOverlayLayer,
} from './utils';
import { panelMotion, withTrigger } from './_overlay';

/* ── Popover ── */

export interface PopoverProps {
  /** The element that opens it (a button). */
  trigger: ReactElement;
  children: ReactNode | ((close: () => void) => ReactNode);
  /** Accessible name for the panel. */
  label?: string;
  title?: ReactNode;
  side?: Side;
  align?: Align;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Panel width in px. */
  width?: number;
  className?: string;
  /** CSS selector of the element to focus when it opens (default: the first focusable one). */
  initialFocus?: string;
}

export function Popover({
  trigger,
  children,
  label,
  title,
  side = 'bottom',
  align = 'start',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  width,
  className,
  initialFocus,
}: PopoverProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const anchor = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), [setOpen]);
  const pos = useFloating(open, anchor, panel, { side, align });
  useOverlayLayer(open, close, false);
  useFocusTrap(panel, open && !!pos, initialFocus);
  useOutsidePress(open, [anchor, panel], close);

  return (
    <>
      {withTrigger(trigger, anchor, {
        onClick: () => setOpen(!open),
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
        'aria-controls': open ? id : undefined,
      })}
      {createPortal(
        <AnimatePresence>
          {open && (
            <m.div
              ref={panel}
              id={id}
              className={cx('popover', className)}
              role="dialog"
              aria-label={label ?? (typeof title === 'string' ? title : undefined)}
              tabIndex={-1}
              style={
                { top: pos?.top ?? -9999, left: pos?.left ?? -9999, width, transformOrigin: originFor(pos?.side ?? side) } as CSSProperties
              }
              variants={pop}
              {...panelMotion}
            >
              {title && <div className="popover-title">{title}</div>}
              {typeof children === 'function' ? children(close) : children}
            </m.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
