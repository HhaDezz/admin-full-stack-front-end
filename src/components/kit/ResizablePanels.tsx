import { type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode, useRef, useState } from 'react';
import { cx, isRtl, useStoredState } from './utils';

export interface ResizablePanelsProps {
  /** Exactly two panels. */
  children: [ReactNode, ReactNode];
  direction?: 'horizontal' | 'vertical';
  /** First panel size in %, before the user drags. */
  defaultSize?: number;
  min?: number;
  max?: number;
  /** Remembers the size in this browser under this key. */
  storageKey?: string;
  /** Height for vertical layouts (or the container height). */
  height?: number | string;
  'aria-label'?: string;
}

export function ResizablePanels({
  children,
  direction = 'horizontal',
  defaultSize = 50,
  min = 15,
  max = 85,
  storageKey,
  height,
  'aria-label': label = 'Resize panels',
}: ResizablePanelsProps) {
  const [size, setSize] = useStoredState(storageKey, defaultSize);
  const box = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 10) / 10));
  const horizontal = direction === 'horizontal';

  const onPointerDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    const rect = box.current!.getBoundingClientRect();
    const rtl = horizontal && isRtl(box.current!);
    setDragging(true);
    const move = (ev: PointerEvent) => {
      const pct = horizontal
        ? ((rtl ? rect.right - ev.clientX : ev.clientX - rect.left) / rect.width) * 100
        : ((ev.clientY - rect.top) / rect.height) * 100;
      setSize(clamp(pct));
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const back = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const fwd = horizontal ? 'ArrowRight' : 'ArrowDown';
    const rtl = horizontal && isRtl(e.currentTarget);
    let next: number | null = null;
    if (e.key === back) next = size + (rtl ? step : -step);
    else if (e.key === fwd) next = size + (rtl ? -step : step);
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    else if (e.key === 'Enter') next = defaultSize;
    if (next != null) {
      e.preventDefault();
      setSize(clamp(next));
    }
  };

  return (
    <div ref={box} className={cx('resizable', horizontal ? 'is-h' : 'is-v', dragging && 'is-dragging')} style={{ height }}>
      <div className="resizable-panel" style={{ flexBasis: `${size}%` }}>
        {children[0]}
      </div>
      <div
        className="resizable-handle"
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={Math.round(size)}
        aria-valuemin={min}
        aria-valuemax={max}
        onPointerDown={onPointerDown}
        onKeyDown={onKey}
        onDoubleClick={() => setSize(defaultSize)}
      >
        <i />
      </div>
      <div className="resizable-panel is-rest">{children[1]}</div>
    </div>
  );
}
