import {
  cloneElement,
  isValidElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { pop } from '../../lib/motion';
import { useOutsidePress, useOverlayLayer } from './utils';
import { menuKeyDown, renderMenuItems, type MenuEntry } from './_menu';
import { panelMotion } from './_overlay';

/* ── ContextMenu: right-click, long-press or the keyboard's menu key ── */

export interface ContextMenuProps {
  /** The area that gets the menu (a row, a card, a file). */
  children: ReactElement;
  /** Entries, or a function of the element that was right-clicked. */
  items: MenuEntry[] | ((target: HTMLElement) => MenuEntry[]);
  label?: string;
  minWidth?: number;
  disabled?: boolean;
}

type ChildProps = {
  onContextMenu?: (e: ReactMouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: ReactKeyboardEvent<HTMLElement>) => void;
  onTouchStart?: (e: ReactTouchEvent<HTMLElement>) => void;
  onTouchEnd?: (e: ReactTouchEvent<HTMLElement>) => void;
  onTouchMove?: (e: ReactTouchEvent<HTMLElement>) => void;
  'aria-haspopup'?: string;
};

export function ContextMenu({ children, items, label = 'Actions', minWidth = 200, disabled }: ContextMenuProps) {
  const [at, setAt] = useState<{ x: number; y: number; entries: MenuEntry[]; opener: HTMLElement | null } | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const typed = useRef({ text: '', at: 0 });
  const press = useRef<ReturnType<typeof setTimeout>>(undefined);

  const close = useCallback((refocus = true) => {
    setAt((cur) => {
      if (refocus) cur?.opener?.focus({ preventScroll: true });
      return null;
    });
  }, []);
  useOverlayLayer(!!at, () => close(), false);
  useOutsidePress(!!at, [panel], () => close(false));

  // Keep the menu inside the window.
  useLayoutEffect(() => {
    if (!at) return setPos(null);
    const p = panel.current;
    const w = p?.offsetWidth ?? minWidth;
    const h = p?.offsetHeight ?? 0;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    setPos({ left: Math.max(8, Math.min(at.x, vw - w - 8)), top: Math.max(8, at.y + h > vh - 8 ? at.y - h : at.y) });
  }, [at, minWidth]);

  useLayoutEffect(() => {
    if (!at) return;
    const onScroll = () => close(false);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [at, close]);

  const openAt = (x: number, y: number, target: HTMLElement) => {
    const entries = typeof items === 'function' ? items(target) : items;
    if (!entries.length) return;
    setAt({ x, y, entries, opener: (document.activeElement as HTMLElement) ?? null });
  };

  if (!isValidElement<ChildProps>(children)) return children;
  const own = children.props;
  const trigger = cloneElement(children, {
    'aria-haspopup': 'menu',
    onContextMenu: (e: ReactMouseEvent<HTMLElement>) => {
      own.onContextMenu?.(e);
      if (disabled || e.defaultPrevented) return;
      e.preventDefault();
      openAt(e.clientX, e.clientY, e.target as HTMLElement);
    },
    onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => {
      own.onKeyDown?.(e);
      if (disabled) return;
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
        e.preventDefault();
        const t = (document.activeElement as HTMLElement) ?? e.currentTarget;
        const r = t.getBoundingClientRect();
        openAt(r.left + Math.min(24, r.width / 2), r.top + Math.min(r.height, 32), t);
      }
    },
    // Long-press on touch screens.
    onTouchStart: (e: ReactTouchEvent<HTMLElement>) => {
      own.onTouchStart?.(e);
      if (disabled) return;
      const t = e.touches[0];
      const target = e.target as HTMLElement;
      press.current = setTimeout(() => openAt(t.clientX, t.clientY, target), 550);
    },
    onTouchEnd: (e: ReactTouchEvent<HTMLElement>) => {
      own.onTouchEnd?.(e);
      clearTimeout(press.current);
    },
    onTouchMove: (e: ReactTouchEvent<HTMLElement>) => {
      own.onTouchMove?.(e);
      clearTimeout(press.current);
    },
  });

  const itemEls = () => [...(panel.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [])];

  return (
    <>
      {trigger}
      {createPortal(
        <AnimatePresence>
          {at && (
            <m.div
              ref={(node: HTMLDivElement | null) => {
                panel.current = node;
                if (node) requestAnimationFrame(() => itemEls()[0]?.focus());
              }}
              role="menu"
              aria-label={label}
              className="menu"
              style={{
                top: pos?.top ?? at.y,
                left: pos?.left ?? at.x,
                minWidth,
                transformOrigin: 'top left',
                visibility: pos ? undefined : 'hidden',
              }}
              onKeyDown={(e) => menuKeyDown(e, itemEls(), typed.current, () => close(false))}
              onContextMenu={(e) => e.preventDefault()}
              variants={pop}
              {...panelMotion}
            >
              {renderMenuItems(at.entries, () => close())}
            </m.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
