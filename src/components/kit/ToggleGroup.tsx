import { type KeyboardEvent, type ReactElement, type ReactNode, useId, useRef } from 'react';
import * as m from 'motion/react-m';
import { cx, isRtl, useControllable } from './utils';

/* ── Toggle group ── */

export interface ToggleItem<V extends string> {
  value: V;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Name for icon-only items. */
  'aria-label'?: string;
}

interface ToggleBase<V extends string> {
  items: ToggleItem<V>[];
  size?: 'sm' | 'md';
  'aria-label': string;
  fullWidth?: boolean;
}

export interface ToggleGroupSingleProps<V extends string> extends ToggleBase<V> {
  multiple?: false;
  value?: V;
  defaultValue?: V;
  onChange?: (v: V) => void;
}

export interface ToggleGroupMultipleProps<V extends string> extends ToggleBase<V> {
  multiple: true;
  value?: V[];
  defaultValue?: V[];
  onChange?: (v: V[]) => void;
}

export function ToggleGroup<V extends string>(props: ToggleGroupMultipleProps<V>): ReactElement;

export function ToggleGroup<V extends string>(props: ToggleGroupSingleProps<V>): ReactElement;

export function ToggleGroup<V extends string>(props: ToggleGroupSingleProps<V> | ToggleGroupMultipleProps<V>): ReactElement {
  return props.multiple ? <ToggleMulti {...props} /> : <ToggleSingle {...props} />;
}

/** Single choice: a radio group with roving focus and a sliding highlight. */
function ToggleSingle<V extends string>({
  items,
  size = 'md',
  value,
  defaultValue,
  onChange,
  fullWidth,
  'aria-label': label,
}: ToggleGroupSingleProps<V>) {
  const [current, set] = useControllable<V | undefined>(value, defaultValue ?? items[0]?.value, onChange as (v: V | undefined) => void);
  const layoutId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = items.filter((i) => !i.disabled);
  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys) && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const dir = isRtl(e.currentTarget) && e.key.startsWith('Arrow') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') ? -1 : 1;
    const i = enabled.findIndex((it) => it.value === current);
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? enabled.length - 1 : (i + keys[e.key] * dir + enabled.length) % enabled.length;
    const next = enabled[n];
    if (next) {
      set(next.value);
      refs.current[items.indexOf(next)]?.focus();
    }
  };
  return (
    <div role="radiogroup" aria-label={label} className={cx('toggle-group', `toggle-${size}`, fullWidth && 'is-full')} onKeyDown={onKey}>
      {items.map((it, i) => {
        const on = it.value === current;
        return (
          <button
            key={it.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={it['aria-label']}
            tabIndex={on ? 0 : -1}
            disabled={it.disabled}
            className={cx('toggle-item', on && 'is-on')}
            onClick={() => set(it.value)}
          >
            {on && <m.span layoutId={layoutId} className="toggle-thumb" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="toggle-content">
              {it.icon}
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Several choices: independent toggle buttons (aria-pressed). */
function ToggleMulti<V extends string>({
  items,
  size = 'md',
  value,
  defaultValue,
  onChange,
  fullWidth,
  'aria-label': label,
}: ToggleGroupMultipleProps<V>) {
  const [current, set] = useControllable<V[]>(value, defaultValue ?? [], onChange);
  return (
    <div role="group" aria-label={label} className={cx('toggle-group', 'is-multi', `toggle-${size}`, fullWidth && 'is-full')}>
      {items.map((it) => {
        const on = current.includes(it.value);
        return (
          <button
            key={it.value}
            type="button"
            aria-pressed={on}
            aria-label={it['aria-label']}
            disabled={it.disabled}
            className={cx('toggle-item', on && 'is-on')}
            onClick={() => set(on ? current.filter((v) => v !== it.value) : [...current, it.value])}
          >
            <span className="toggle-content">
              {it.icon}
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
