import { useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { pop } from '../../lib/motion';
import { type Align, cx, originFor, type Side, useFloating, useOverlayLayer } from './utils';
import { panelMotion, withTrigger } from './_overlay';

/* ── HoverCard: a rich preview when pointing at (or focusing) a link ── */

export interface HoverCardProps {
  /** Usually a link that also works on its own; the card is a preview, never the only way to the content. */
  children: ReactElement;
  content: ReactNode;
  openDelay?: number;
  closeDelay?: number;
  side?: Side;
  align?: Align;
  width?: number;
  className?: string;
}

export function HoverCard({
  children,
  content,
  openDelay = 500,
  closeDelay = 200,
  side = 'bottom',
  align = 'start',
  width = 300,
  className,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLElement | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pos = useFloating(open, anchor, card, { side, align, offset: 8 });
  useOverlayLayer(open, () => setOpen(false), false);

  const later = (v: boolean, ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(v), ms);
  };

  return (
    <>
      {withTrigger(children, anchor, {
        onPointerEnter: (e: PointerEvent) => e.pointerType !== 'touch' && later(true, openDelay),
        onPointerLeave: () => later(false, closeDelay),
        onFocus: () => later(true, 150),
        onBlur: (e: FocusEvent) => {
          if (!card.current?.contains(e.relatedTarget as Node)) later(false, closeDelay);
        },
      })}
      {createPortal(
        <AnimatePresence>
          {open && (
            <m.div
              ref={card}
              className={cx('hovercard', className)}
              style={
                { top: pos?.top ?? -9999, left: pos?.left ?? -9999, width, transformOrigin: originFor(pos?.side ?? side) } as CSSProperties
              }
              onPointerEnter={() => clearTimeout(timer.current)}
              onPointerLeave={() => later(false, closeDelay)}
              variants={pop}
              {...panelMotion}
            >
              {content}
            </m.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
