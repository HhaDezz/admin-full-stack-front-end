import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { duration, easing } from '../../lib/motion';
import { cx, isRtl, useControllable } from './utils';

/* ── Tabs ── */

export interface TabItem<V extends string = string> {
  value: V;
  label: ReactNode;
  icon?: ReactNode;
  /** Small count or badge after the label. */
  badge?: ReactNode;
  disabled?: boolean;
  /** Panel content. Leave out to render panels yourself. */
  content?: ReactNode;
}

export interface TabsProps<V extends string> {
  items: TabItem<V>[];
  value?: V;
  defaultValue?: V;
  onChange?: (v: V) => void;
  variant?: 'line' | 'pill' | 'enclosed';
  fullWidth?: boolean;
  'aria-label'?: string;
  /** Animate panel changes (default true). */
  animated?: boolean;
}

/** Tab bar with a sliding indicator; arrow keys move between tabs (automatic activation). */
export function Tabs<V extends string>({
  items,
  value,
  defaultValue,
  onChange,
  variant = 'line',
  fullWidth,
  'aria-label': label,
  animated = true,
}: TabsProps<V>) {
  const [current, set] = useControllable<V>(value, defaultValue ?? items.find((i) => !i.disabled)?.value ?? items[0].value, onChange);
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = items.filter((i) => !i.disabled);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = isRtl(e.currentTarget);
    const delta: Record<string, number> = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
    let next: TabItem<V> | undefined;
    const i = enabled.findIndex((t) => t.value === current);
    if (e.key in delta) next = enabled[(i + delta[e.key] + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next) {
      e.preventDefault();
      set(next.value);
      refs.current[next.value]?.focus();
    }
  };
  const active = items.find((i) => i.value === current);
  const hasPanels = items.some((i) => i.content !== undefined);
  return (
    <div className={cx('tabs', `tabs-${variant}`)}>
      <div role="tablist" aria-label={label} className={cx('tab-list', fullWidth && 'is-full')} onKeyDown={onKey}>
        {items.map((t) => {
          const on = t.value === current;
          return (
            <button
              key={t.value}
              ref={(el) => {
                refs.current[t.value] = el;
              }}
              id={`${base}-t-${t.value}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={hasPanels ? `${base}-p-${t.value}` : undefined}
              tabIndex={on ? 0 : -1}
              disabled={t.disabled}
              className={cx('tab', on && 'is-on')}
              onClick={() => set(t.value)}
            >
              {on && <m.span layoutId={`${base}-ind`} className="tab-ind" transition={{ type: 'spring', stiffness: 480, damping: 38 }} />}
              <span className="tab-content">
                {t.icon}
                {t.label}
                {t.badge != null && <span className="tab-badge">{t.badge}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {hasPanels && active && (
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={active.value}
            role="tabpanel"
            id={`${base}-p-${active.value}`}
            aria-labelledby={`${base}-t-${active.value}`}
            tabIndex={0}
            className="tab-panel"
            initial={animated ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0, transition: { duration: duration.fast, ease: easing.enter } }}
            exit={animated ? { opacity: 0, transition: { duration: duration.instant } } : undefined}
          >
            {active.content}
          </m.div>
        </AnimatePresence>
      )}
    </div>
  );
}
