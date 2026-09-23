import { CalendarDays, X } from 'lucide-react';
import type { Matcher } from 'react-day-picker';
import { useControlProps } from './_form';
import { appLang, formatDate, startOfDay } from './_date';
import { Calendar } from './Calendar';
import { Popover } from './Popover';
import { cx, useControllable } from './utils';

/* ── DatePicker: a field that opens a calendar ── */

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (d: Date | null) => void;
  /** Earliest and latest selectable dates. */
  min?: Date;
  max?: Date;
  /** More dates to refuse, e.g. weekends: { dayOfWeek: [0, 6] }. */
  disabledDates?: Matcher | Matcher[];
  placeholder?: string;
  clearable?: boolean;
  /** How the chosen date is shown (Intl options). */
  format?: Intl.DateTimeFormatOptions;
  /** Month and year dropdowns in the calendar header (birthdays, far-off dates). */
  dropdowns?: boolean;
  lang?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  'aria-label'?: string;
  onBlur?: () => void;
}

export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  disabledDates,
  placeholder = 'Pick a date',
  clearable = true,
  format = { dateStyle: 'medium' },
  dropdowns,
  lang,
  size = 'md',
  disabled,
  invalid,
  id,
  'aria-label': label,
  onBlur,
}: DatePickerProps) {
  const c = useControlProps({ id, disabled, invalid });
  const [date, setDate] = useControllable<Date | null>(value, defaultValue, onChange);
  const l = appLang(lang);
  const today = startOfDay(new Date());
  const off: Matcher[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
    ...(disabledDates ? ([] as Matcher[]).concat(disabledDates) : []),
  ];
  const todayAllowed = (!min || today >= startOfDay(min)) && (!max || today <= startOfDay(max));
  const text = formatDate(date, l, format);

  return (
    <div className={cx('date-field', clearable && date && !c.disabled && 'has-clear')}>
      <Popover
        label={label ? `${label}: choose a date` : 'Choose a date'}
        className="date-pop"
        initialFocus=".rdp-day_button[tabindex='0']"
        onOpenChange={(o) => !o && onBlur?.()}
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
            <CalendarDays size={16} className="date-icon" aria-hidden="true" />
            <span className={cx('date-text', !date && 'is-placeholder')}>{text || placeholder}</span>
          </button>
        }
      >
        {(close) => (
          <>
            <Calendar
              mode="single"
              lang={l}
              selected={date ?? undefined}
              defaultMonth={date ?? (max && today > max ? max : min && today < min ? min : today)}
              startMonth={min}
              endMonth={max}
              captionLayout={dropdowns ? 'dropdown' : 'label'}
              disabled={off.length ? off : undefined}
              onSelect={(d) => {
                setDate(d ?? null);
                if (d) close();
              }}
            />
            <div className="date-foot">
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                disabled={!todayAllowed}
                onClick={() => {
                  setDate(today);
                  close();
                }}
              >
                Today
              </button>
              {clearable && date && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setDate(null);
                    close();
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </>
        )}
      </Popover>
      {clearable && date && !c.disabled && (
        <button
          type="button"
          className="control-clear date-clear"
          aria-label={label ? `Clear ${label}` : 'Clear date'}
          onClick={() => setDate(null)}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
