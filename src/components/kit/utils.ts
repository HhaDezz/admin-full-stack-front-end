import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

/** Joins class names, skipping falsy values. */
/** Is this element laid out right-to-left? Reads the nearest dir attribute, then computed style. */
export function isRtl(el: Element | null | undefined): boolean {
  if (!el) return false;
  const d = el.closest('[dir]')?.getAttribute('dir');
  if (d === 'rtl' || d === 'ltr') return d === 'rtl';
  return getComputedStyle(el).direction === 'rtl';
}

export function cx(...parts: unknown[]): string {
  return parts.filter((p) => typeof p === 'string' && p).join(' ');
}

/**
 * Controlled-or-uncontrolled state. Pass `value` to control it, or leave it undefined
 * and the component keeps its own state starting from `defaultValue`.
 */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set] as const;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[inert]') && el.offsetParent !== null);
}

/**
 * Traps Tab inside `ref` while active, focuses the first field (or the container) on
 * open, and returns focus to whatever had it before when it closes.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, initial?: RefObject<HTMLElement | null> | string) {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const opener = document.activeElement as HTMLElement | null;
    const wanted = typeof initial === 'string' ? node.querySelector<HTMLElement>(initial) : initial?.current;
    const first = wanted ?? node.querySelector<HTMLElement>('[autofocus]') ?? focusables(node).find((el) => !el.dataset.skipFocus);
    (first ?? node).focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables(node);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === node)) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [active, ref, initial]);
}

/* ── Overlay stack: only the top-most overlay reacts to Escape, and body scroll locks once ── */

const stack: number[] = [];
let nextId = 1;

export function useOverlayLayer(open: boolean, onEscape?: () => void, lockScroll = true) {
  const id = useRef(0);
  const esc = useRef(onEscape);
  esc.current = onEscape;
  useEffect(() => {
    if (!open) return;
    id.current = nextId++;
    stack.push(id.current);
    if (lockScroll) {
      const prev = document.body.style.overflow;
      document.body.dataset.scrollLocks = String(Number(document.body.dataset.scrollLocks ?? 0) + 1);
      document.body.style.overflow = 'hidden';
      document.body.dataset.scrollPrev ??= prev;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === id.current && esc.current) {
        e.preventDefault();
        e.stopPropagation();
        esc.current();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const i = stack.indexOf(id.current);
      if (i >= 0) stack.splice(i, 1);
      if (lockScroll) {
        const left = Number(document.body.dataset.scrollLocks ?? 1) - 1;
        document.body.dataset.scrollLocks = String(left);
        if (left <= 0) {
          document.body.style.overflow = document.body.dataset.scrollPrev ?? '';
          delete document.body.dataset.scrollPrev;
          delete document.body.dataset.scrollLocks;
        }
      }
    };
  }, [open, lockScroll]);
  /** True when this overlay is the top-most one. */
  return useCallback(() => stack[stack.length - 1] === id.current, []);
}

/** Calls `onOutside` for pointer-downs outside every given element. */
export function useOutsidePress(open: boolean, refs: RefObject<HTMLElement | null>[], onOutside: () => void) {
  const cb = useRef(onOutside);
  cb.current = onOutside;
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (refs.some((r) => r.current?.contains(t))) return;
      cb.current();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
    // refs are stable ref objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

/* ── Floating positioning (tooltips, popovers, menus) ── */

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';

export interface FloatingPos {
  top: number;
  left: number;
  side: Side;
  /** Room available on the chosen side, in px. */
  space: number;
}

const EDGE = 8;
const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Places a fixed-position element next to its anchor. Flips to the other side when
 * there isn't room, keeps it inside the viewport, and follows scroll and resize.
 */
export function useFloating(
  open: boolean,
  anchor: RefObject<HTMLElement | null>,
  floating: RefObject<HTMLElement | null>,
  { side = 'bottom', align = 'center', offset = 8 }: { side?: Side; align?: Align; offset?: number } = {},
) {
  const [pos, setPos] = useState<FloatingPos | null>(null);
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      const a = anchor.current;
      const f = floating.current;
      if (!a) return;
      const r = a.getBoundingClientRect();
      const fw = f?.offsetWidth ?? 0;
      const fh = f?.offsetHeight ?? 0;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const room: Record<Side, number> = {
        top: r.top - offset - EDGE,
        bottom: vh - r.bottom - offset - EDGE,
        left: r.left - offset - EDGE,
        right: vw - r.right - offset - EDGE,
      };
      const need = side === 'top' || side === 'bottom' ? fh : fw;
      const rtl = isRtl(a);
      let s: Side = side;
      if (rtl && (s === 'left' || s === 'right')) s = OPPOSITE[s];
      if (room[s] < need && room[OPPOSITE[s]] > room[s]) s = OPPOSITE[s];
      const al: Align = rtl && align !== 'center' ? (align === 'start' ? 'end' : 'start') : align;
      let top: number;
      let left: number;
      if (s === 'top' || s === 'bottom') {
        top = s === 'bottom' ? r.bottom + offset : r.top - offset - fh;
        left = al === 'start' ? r.left : al === 'end' ? r.right - fw : r.left + r.width / 2 - fw / 2;
        left = Math.min(Math.max(EDGE, left), vw - fw - EDGE);
      } else {
        left = s === 'right' ? r.right + offset : r.left - offset - fw;
        top = al === 'start' ? r.top : al === 'end' ? r.bottom - fh : r.top + r.height / 2 - fh / 2;
        top = Math.min(Math.max(EDGE, top), vh - fh - EDGE);
      }
      setPos((p) => (p && p.top === top && p.left === left && p.side === s ? p : { top, left, side: s, space: room[s] }));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    // Measure again once the floating element has rendered at its real size.
    frame = requestAnimationFrame(measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (floating.current) ro?.observe(floating.current);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    return () => {
      cancelAnimationFrame(frame);
      ro?.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [open, anchor, floating, side, align, offset]);
  return pos;
}

/** CSS transform-origin that makes a popover grow out of its anchor. */
export function originFor(side: Side): string {
  return { top: 'bottom center', bottom: 'top center', left: 'center right', right: 'center left' }[side];
}

/** Persists a value in localStorage (per browser), failing quietly when storage is blocked. */
export function useStoredState<T>(key: string | undefined, initial: T) {
  const [v, setV] = useState<T>(() => {
    if (!key) return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* storage unavailable */
    }
  }, [key, v]);
  return [v, setV] as const;
}

/** A box that scrolls sideways (a wide table) becomes a tab stop only while it overflows, so keyboard users can
 * scroll it with the arrow keys. Returns a ref for the scrolling element. */
export function useScrollFocus<T extends HTMLElement = HTMLDivElement>(existing?: RefObject<T | null>) {
  const own = useRef<T>(null);
  const ref = existing ?? own;
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const sync = () => {
      const scrolls = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
      if (scrolls && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      else if (!scrolls && el.getAttribute('tabindex') === '0' && el.dataset.scrollFocus) el.removeAttribute('tabindex');
      if (scrolls) el.dataset.scrollFocus = '1';
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [ref]);
  return ref;
}
