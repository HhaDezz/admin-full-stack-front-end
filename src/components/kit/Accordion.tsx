import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { ChevronDown } from 'lucide-react';
import { duration, easing } from '../../lib/motion';
import { cx } from './utils';

/* ── Accordion ── */

export interface AccordionItem {
  value: string;
  title: ReactNode;
  content: ReactNode;
  /** Text or icon after the title. */
  meta?: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several open at once. */
  multiple?: boolean;
  defaultOpen?: string[];
  variant?: 'separated' | 'joined';
  headingLevel?: 2 | 3 | 4;
}

export function Accordion({ items, multiple, defaultOpen = [], variant = 'joined', headingLevel = 3 }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const H = `h${headingLevel}` as 'h3';
  const toggle = (v: string) => setOpen((o) => (o.includes(v) ? o.filter((x) => x !== v) : multiple ? [...o, v] : [v]));
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = items.length;
    const to = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (to != null) {
      e.preventDefault();
      refs.current[to]?.focus();
    }
  };
  return (
    <div className={cx('accordion', `is-${variant}`)}>
      {items.map((it, i) => {
        const on = open.includes(it.value);
        return (
          <div key={it.value} className={cx('acc-item', on && 'is-open')}>
            <H className="acc-h">
              <button
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                id={`${base}-h-${i}`}
                className="acc-trigger"
                aria-expanded={on}
                aria-controls={`${base}-p-${i}`}
                disabled={it.disabled}
                onClick={() => toggle(it.value)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="acc-title">{it.title}</span>
                {it.meta && <span className="acc-meta">{it.meta}</span>}
                <ChevronDown size={17} className="acc-caret" />
              </button>
            </H>
            <AnimatePresence initial={false}>
              {on && (
                <m.div
                  id={`${base}-p-${i}`}
                  role="region"
                  aria-labelledby={`${base}-h-${i}`}
                  className="acc-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: duration.base, ease: easing.enter } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: duration.fast, ease: easing.exit } }}
                >
                  <div className="acc-body">{it.content}</div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
