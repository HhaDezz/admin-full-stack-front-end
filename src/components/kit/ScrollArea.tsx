import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cx } from './utils';

export interface ScrollAreaProps {
  children: ReactNode;
  maxHeight?: number | string;
  /** Soft shadows on edges that have more content. */
  shadows?: boolean;
  /** Accessible name; makes the area keyboard-scrollable. */
  'aria-label'?: string;
  className?: string;
}

export function ScrollArea({ children, maxHeight = 320, shadows = true, 'aria-label': label, className }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const update = () => {
    const el = ref.current;
    if (!el) return;
    const top = el.scrollTop > 1;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setEdges((e) => (e.top === top && e.bottom === bottom ? e : { top, bottom }));
  };
  useEffect(() => {
    update();
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={cx('scroll-area', shadows && edges.top && 'shadow-top', shadows && edges.bottom && 'shadow-bottom', className)}>
      <div
        ref={ref}
        className="scroll-area-viewport"
        style={{ maxHeight }}
        onScroll={update}
        tabIndex={label ? 0 : undefined}
        role={label ? 'region' : undefined}
        aria-label={label}
      >
        <div>{children}</div>
      </div>
    </div>
  );
}
