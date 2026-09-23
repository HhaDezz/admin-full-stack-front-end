import { DayPicker, UI, useDayPicker, type DayPickerProps, type NavProps } from 'react-day-picker';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { appLang, dayPickerFormatters, weekStart } from './_date';
import { cx } from './utils';

/* ── Calendar: react-day-picker, styled with the design tokens ── */

/**
 * Month arrows in a plain group rather than a <nav> landmark: a page (or a docs page) can show
 * several calendars, and landmarks must be unique. Same behaviour as react-day-picker's Nav.
 */
function CalNav({ onPreviousClick, onNextClick, previousMonth, nextMonth, ...rest }: NavProps) {
  const { components, classNames, labels } = useDayPicker();
  const { 'aria-label': label, className, style } = rest as { 'aria-label'?: string; className?: string; style?: React.CSSProperties };
  return (
    <div role="group" aria-label={label} className={className} style={style}>
      <components.PreviousMonthButton
        type="button"
        className={classNames[UI.PreviousMonthButton]}
        tabIndex={previousMonth ? undefined : -1}
        aria-disabled={previousMonth ? undefined : true}
        aria-label={labels.labelPrevious(previousMonth)}
        onClick={(e) => previousMonth && onPreviousClick?.(e)}
      >
        <components.Chevron disabled={previousMonth ? undefined : true} className={classNames[UI.Chevron]} orientation="left" />
      </components.PreviousMonthButton>
      <components.NextMonthButton
        type="button"
        className={classNames[UI.NextMonthButton]}
        tabIndex={nextMonth ? undefined : -1}
        aria-disabled={nextMonth ? undefined : true}
        aria-label={labels.labelNext(nextMonth)}
        onClick={(e) => nextMonth && onNextClick?.(e)}
      >
        <components.Chevron disabled={nextMonth ? undefined : true} className={classNames[UI.Chevron]} orientation="right" />
      </components.NextMonthButton>
    </div>
  );
}

export type CalendarProps = DayPickerProps & {
  /** BCP 47 language for month and weekday names and the first day of the week (default: the page's). */
  lang?: string;
};

/**
 * A month grid for picking one date, several, or a range. Every DayPicker prop works
 * (mode, selected, onSelect, disabled, numberOfMonths, captionLayout, startMonth, endMonth…).
 */
export function Calendar({ className, components, formatters, lang, weekStartsOn, showOutsideDays = true, ...props }: CalendarProps) {
  const l = appLang(lang);
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn ?? weekStart(l)}
      lang={l}
      className={cx('cal', className)}
      formatters={{ ...dayPickerFormatters(l), ...formatters }}
      components={{
        Nav: CalNav,
        Chevron: ({ orientation, size = 16 }) =>
          orientation === 'left' ? (
            <ChevronLeft size={size} className="flip-rtl" />
          ) : orientation === 'right' ? (
            <ChevronRight size={size} className="flip-rtl" />
          ) : (
            <ChevronDown size={size} />
          ),
        ...components,
      }}
      {...(props as DayPickerProps)}
    />
  );
}
