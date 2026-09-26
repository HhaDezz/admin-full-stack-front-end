import { useLayoutEffect, useState, type RefObject } from 'react';

export interface MenuPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  /** Room available for the menu, in px. */
  space: number;
  placement: 'bottom' | 'top';
}

const GAP = 6;
const EDGE = 8;

/**
 * Keeps a fixed-position menu attached to its trigger. Opens below, or above when
 * there is clearly more room there, and follows the trigger on scroll and resize.
 */
export function useMenuPosition(open: boolean, anchor: RefObject<HTMLElement | null>, wanted: number, minWidth = 240) {
  const [pos, setPos] = useState<MenuPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      const el = anchor.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const width = Math.min(Math.max(r.width, minWidth), vw - EDGE * 2);
      const dir = getComputedStyle(el).direction;
      const preferredLeft = dir === 'rtl' ? r.right - width : r.left;
      const left = Math.min(Math.max(EDGE, preferredLeft), vw - width - EDGE);
      const below = vh - r.bottom - GAP - EDGE;
      const above = r.top - GAP - EDGE;
      const placeBelow = below >= Math.min(wanted, 240) || below >= above;
      setPos(
        placeBelow
          ? { left, width, top: r.bottom + GAP, space: below, placement: 'bottom' }
          : { left, width, bottom: vh - r.top + GAP, space: above, placement: 'top' },
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [open, anchor, wanted, minWidth]);

  return pos;
}
