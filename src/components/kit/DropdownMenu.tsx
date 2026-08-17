import { type KeyboardEvent as ReactKeyboardEvent, type ReactElement, useCallback, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { pop } from '../../lib/motion';
import { type Align, originFor, type Side, useFloating, useOutsidePress, useOverlayLayer } from './utils';
import { menuKeyDown, renderMenuItems, type MenuEntry } from './_menu';

export type { MenuEntry };
import { panelMotion, withTrigger } from './_overlay';

/* ── Dropdown menu ── */

export interface DropdownMenuProps {
  trigger: ReactElement;
  items: MenuEntry[];
  label?: string;
  side?: Side;
  align?: Align;
  minWidth?: number;
}

export function DropdownMenu({ trigger, items, label = 'Menu', side = 'bottom', align = 'start', minWidth = 200 }: DropdownMenuProps) {
  const [open, setOpenState] = useState(false);
  const anchor = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const focusFirst = useRef<'first' | 'last'>('first');
  const typed = useRef({ text: '', at: 0 });
  const id = useId();
  const pos = useFloating(open, anchor, panel, { side, align, offset: 6 });

  const setOpen = useCallback((v: boolean, refocus = true) => {
    setOpenState(v);
    if (!v && refocus) anchor.current?.focus();
  }, []);
  useOverlayLayer(open, () => setOpen(false), false);
  useOutsidePress(open, [anchor, panel], () => setOpen(false, false));

  const itemEls = () => [...(panel.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [])];
  const onPanelRef = (node: HTMLDivElement | null) => {
    panel.current = node;
    if (node)
      requestAnimationFrame(() => {
        const els = itemEls();
        (focusFirst.current === 'last' ? els[els.length - 1] : els[0])?.focus();
      });
  };

  const onMenuKey = (e: ReactKeyboardEvent) => menuKeyDown(e, itemEls(), typed.current, () => setOpen(false, false));

  return (
    <>
      {withTrigger(trigger, anchor, {
        onClick: () => {
          focusFirst.current = 'first';
          setOpen(!open, false);
        },
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            focusFirst.current = e.key === 'ArrowUp' ? 'last' : 'first';
            setOpen(true);
          }
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? id : undefined,
      })}
      {createPortal(
        <AnimatePresence>
          {open && (
            <m.div
              ref={onPanelRef}
              id={id}
              role="menu"
              aria-label={label}
              className="menu"
              onKeyDown={onMenuKey}
              style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, minWidth, transformOrigin: originFor(pos?.side ?? side) }}
              variants={pop}
              {...panelMotion}
            >
              {renderMenuItems(items, () => setOpen(false))}
            </m.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
