import { type ReactElement, type ReactNode, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type Align, cx, type Side, useFloating, useOverlayLayer } from './utils';
import { withTrigger } from './_overlay';

/* ── Tooltip ── */

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: Side;
  align?: Align;
  /** ms before showing on hover. Focus shows it straight away. */
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({ content, children, side = 'top', align = 'center', delay = 350, disabled }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLElement | null>(null);
  const tip = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  const pos = useFloating(open, anchor, tip, { side, align, offset: 7 });
  useOverlayLayer(open, () => setOpen(false), false);
  const show = (ms: number) => {
    if (disabled) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), ms);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  return (
    <>
      {withTrigger(children, anchor, {
        onPointerEnter: (e: PointerEvent) => e.pointerType !== 'touch' && show(delay),
        onPointerLeave: hide,
        onFocus: () => show(0),
        onBlur: hide,
        onPointerDown: hide,
        'aria-describedby': disabled ? undefined : id,
      })}
      {/* Kept in the DOM (hidden) so aria-describedby always resolves. */}
      {createPortal(
        <div
          ref={tip}
          id={id}
          role="tooltip"
          className={cx('tooltip', open && pos && 'is-open', pos && `is-${pos.side}`)}
          style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
          hidden={!open}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}
