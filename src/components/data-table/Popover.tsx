import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Small dropdown anchored to a button. Closes on outside click or Escape. */
export function Popover({ trigger, children, label }: { trigger: (open: boolean) => ReactNode; children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="pop" ref={ref}>
      <span onClick={() => setOpen((o) => !o)}>{trigger(open)}</span>
      {open && (
        <div className="pop-panel" role="menu" aria-label={label}>
          {children}
        </div>
      )}
    </div>
  );
}
