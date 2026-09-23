/* Locale helpers for the date and time components. They use the browser's Intl APIs, so
 * month names, weekday names, week start and 12/24-hour clocks follow the user's language
 * without bundling locale files. */

export function appLang(lang?: string): string {
  if (lang) return lang;
  if (typeof document !== 'undefined' && document.documentElement.lang) return document.documentElement.lang;
  return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
}

/** 0 = Sunday … 6 = Saturday, from the locale (Monday where unknown, Sunday for US-style locales). */
export function weekStart(lang: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  try {
    const loc = new Intl.Locale(lang) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return (info.firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  } catch {
    /* fall through */
  }
  return /-(US|CA|BR|JP|IL|PH|MX)$/i.test(lang) || lang === 'en' ? 0 : 1;
}

export function uses12h(lang: string): boolean {
  try {
    const hc = new Intl.DateTimeFormat(lang, { hour: 'numeric' }).resolvedOptions().hourCycle;
    return hc === 'h12' || hc === 'h11';
  } catch {
    return false;
  }
}

export function formatDate(d: Date | null | undefined, lang: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  return d ? new Intl.DateTimeFormat(lang, opts).format(d) : '';
}

export function formatRange(
  from: Date,
  to: Date | undefined,
  lang: string,
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  const f = new Intl.DateTimeFormat(lang, opts);
  if (!to || sameDay(from, to)) return f.format(from);
  return (
    (f as Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string }).formatRange?.(from, to) ??
    `${f.format(from)} – ${f.format(to)}`
  );
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Intl-based formatters for DayPicker (caption, weekday and dropdown names). */
export function dayPickerFormatters(lang: string) {
  const caption = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' });
  const weekday = new Intl.DateTimeFormat(lang, { weekday: 'short' });
  const month = new Intl.DateTimeFormat(lang, { month: 'short' });
  const year = new Intl.DateTimeFormat(lang, { year: 'numeric' });
  return {
    formatCaption: (d: Date) => caption.format(d),
    formatWeekdayName: (d: Date) => weekday.format(d),
    formatMonthDropdown: (d: Date) => month.format(d),
    formatYearDropdown: (d: Date) => year.format(d),
  };
}
