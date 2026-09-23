import { useEffect, useState } from 'react';
import { CalendarRange, X } from 'lucide-react';
import type { DateRange, Matcher } from 'react-day-picker';
import { useControlProps } from './_form';
import { addDays, appLang, formatRange, sameDay, startOfDay } from './_date';
import { Calendar } from './Calendar';
import { Popover } from './Popover';
import { cx, useControllable } from './utils';

/* ── DateRangePicker: two months side by side, with quick presets ── */

export type { DateRange };

export interface RangePreset {
  label: string;
  range: () => { from: Date; to: Date };
}

const today = () => startOfDay(new Date());

export const DEFAULT_RANGE_PRESETS: RangePreset[] = [
  { label: 'Today', range: () => ({ from: today(), to: today() }) },
  { label: 'Yesterday', range: () => ({ from: addDays(today(), -1), to: addDays(today(), -1) }) },
  { label: 'Last 7 days', range: () => ({ from: addDays(today(), -6), to: today() }) },
  { label: 'Last 30 days', range: () => ({ from: addDays(today(), -29), to: today() }) },
  {
    label: 'This month',
    range: () => {
      const t = today();
      return { from: new Date(t.getFullYear(), t.getMonth(), 1), to: t };
    },
  },
  {
    label: 'Last month',
    range: () => {
      const t = today();
      return { from: new Date(t.getFullYear(), t.getMonth() - 1, 1), to: new Date(t.getFullYear(), t.getMonth(), 0) };
    },
  },
  {
    label: 'This year',
    range: () => {
      const t = today();
      return { from: new Date(t.getFullYear(), 0, 1), to: t };
    },
  },
];

export interface DateRangePickerProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (r: DateRange | null) => void;
  min?: Date;
  max?: Date;
  disabledDates?: Matcher | Matcher[];
  /** Quick choices on the side. Pass [] to hide them. */
  presets?: RangePreset[];
  /** Longest allowed range, in days. */
  maxDays?: number;
  placeholder?: string;
  clearable?: boolean;
  format?: Intl.DateTimeFormatOptions;
  lang?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  'aria-label'?: string;
  onBlur?: () => void;
}

function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 640px)');
    if (!mq) return;
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

export function DateRangePicker({
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  disabledDates,
  presets = DEFAULT_RANGE_PRESETS,
  maxDays,
  placeholder = 'Pick dates',
  clearable = true,
  format = { dateStyle: 'medium' },
  lang,
  size = 'md',
  disabled,
  invalid,
  id,
  'aria-label': label,
  onBlur,
}: DateRangePickerProps) {
  const c = useControlProps({ id, disabled, invalid });
  const [range, setRange] = useControllable<DateRange | null>(value, defaultValue, onChange);
  const [draft, setDraft] = useState<DateRange | undefined>(range ?? undefined);
  const narrow = useNarrow();
  const l = appLang(lang);
  const off: Matcher[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
    ...(disabledDates ? ([] as Matcher[]).concat(disabledDates) : []),
  ];
  const text = range?.from ? formatRange(range.from, range.to, l, format) : '';
  const active = presets.find((p) => {
    const r = p.range();
    return range?.from && range.to && sameDay(r.from, range.from) && sameDay(r.to, range.to);
  });

  return (
    <div className={cx('date-field', clearable && range?.from && !c.disabled && 'has-clear')}>
      <Popover
        label={label ? `${label}: choose dates` : 'Choose dates'}
        className={cx('date-pop', 'is-range', presets.length > 0 && 'has-presets')}
        initialFocus=".rdp-day_button[tabindex='0']"
        onOpenChange={(o) => {
          if (o) setDraft(range ?? undefined);
          else onBlur?.();
        }}
        trigger={
          <button
            type="button"
            id={c.id}
            className={cx('control', 'date-trigger', `control-${size}`, c.invalid && 'is-invalid', c.disabled && 'is-disabled')}
            disabled={c.disabled}
            aria-label={label ? `${label}: ${text || 'not set'}` : undefined}
            aria-invalid={c['aria-invalid']}
            aria-describedby={c['aria-describedby']}
          >
            <CalendarRange size={16} className="date-icon" aria-hidden="true" />
            <span className={cx('date-text', !range?.from && 'is-placeholder')}>{active ? active.label : text || placeholder}</span>
          </button>
        }
      >
        {(close) => (
          <div className="range-panel">
            {presets.length > 0 && (
              <ul className="range-presets" aria-label="Quick ranges">
                {presets.map((p) => (
                  <li key={p.label}>
                    <button
                      type="button"
                      className={cx('range-preset', active?.label === p.label && 'is-on')}
                      aria-pressed={active?.label === p.label}
                      onClick={() => {
                        setRange(p.range());
                        close();
                      }}
                    >
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="range-cal">
              <Calendar
                mode="range"
                lang={l}
                numberOfMonths={narrow ? 1 : 2}
                selected={draft}
                defaultMonth={draft?.from ?? (narrow ? new Date() : addDays(new Date(), -28))}
                startMonth={min}
                endMonth={max}
                max={maxDays ? maxDays - 1 : undefined}
                disabled={off.length ? off : undefined}
                onSelect={(r, day) => {
                  // Clicking again after a full range starts a new one.
                  const next = draft?.from && draft.to ? { from: day, to: undefined } : r;
                  setDraft(next);
                  if (next?.from && next.to && !sameDay(next.from, next.to)) {
                    setRange(next);
                    close();
                  }
                }}
              />
              <div className="date-foot">
                <span className="range-hint" aria-live="polite">
                  {draft?.from && !draft.to ? 'Now pick the end date' : maxDays ? `Up to ${maxDays} days` : ''}
                </span>
                {draft?.from && (!draft.to || sameDay(draft.from, draft.to)) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      setRange({ from: draft.from, to: draft.from });
                      close();
                    }}
                  >
                    Just this day
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Popover>
      {clearable && range?.from && !c.disabled && (
        <button
          type="button"
          className="control-clear date-clear"
          aria-label={label ? `Clear ${label}` : 'Clear dates'}
          onClick={() => setRange(null)}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
