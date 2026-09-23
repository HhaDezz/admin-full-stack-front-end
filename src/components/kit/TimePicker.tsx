import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Clock } from 'lucide-react';
import { useControlProps } from './_form';
import { appLang, uses12h } from './_date';
import { Popover } from './Popover';
import { cx, useControllable } from './utils';

/* ── TimePicker: hour and minute segments you can type into, plus a quick list ── */

export interface TimePickerProps {
  /** "HH:mm", 24-hour (e.g. "14:30"), or null. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (v: string | null) => void;
  /** Minutes moved by the arrow keys. */
  step?: number;
  /** Minutes between the times in the quick list; 0 hides the list. */
  listStep?: number;
  /** Earliest and latest times in the quick list ("HH:mm"). */
  listFrom?: string;
  listTo?: string;
  /** Force a 12- or 24-hour clock (default: from the language). */
  hour12?: boolean;
  lang?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  'aria-label'?: string;
  onBlur?: () => void;
}

type Seg = 'h' | 'm' | 'p';

const pad = (n: number) => String(n).padStart(2, '0');

function parse(v: string | null | undefined): { h: number | null; m: number | null } {
  const m = v ? /^(\d{1,2}):(\d{2})$/.exec(v) : null;
  return m ? { h: Math.min(23, Number(m[1])), m: Math.min(59, Number(m[2])) } : { h: null, m: null };
}

export function TimePicker({
  value,
  defaultValue = null,
  onChange,
  step = 5,
  listStep = 30,
  listFrom = '00:00',
  listTo = '23:59',
  hour12,
  lang,
  size = 'md',
  disabled,
  invalid,
  id,
  'aria-label': label = 'Time',
  onBlur,
}: TimePickerProps) {
  const c = useControlProps({ id, disabled, invalid });
  const [time, setTime] = useControllable<string | null>(value, defaultValue, onChange);
  const l = appLang(lang);
  const twelve = hour12 ?? uses12h(l);
  // Partly-typed values live here until both segments are set.
  const [h, setH] = useState<number | null>(parse(time).h);
  const [m, setM] = useState<number | null>(parse(time).m);
  const [pm, setPm] = useState((parse(time).h ?? 0) >= 12);
  const typed = useRef('');
  const refs = { h: useRef<HTMLSpanElement>(null), m: useRef<HTMLSpanElement>(null), p: useRef<HTMLSpanElement>(null) };

  useEffect(() => {
    const p = parse(time);
    setH(p.h);
    setM(p.m);
    if (p.h != null) setPm(p.h >= 12);
  }, [time]);

  const emit = (hh: number | null, mm: number | null) => {
    setH(hh);
    setM(mm);
    if (hh != null) setPm(hh >= 12);
    setTime(hh != null && mm != null ? `${pad(hh)}:${pad(mm)}` : null);
  };

  const displayHour = h == null ? null : twelve ? ((h + 11) % 12) + 1 : h;
  const fmt = new Intl.DateTimeFormat(l, { hour: 'numeric', minute: '2-digit', hour12: twelve });
  const asText = (hh: number, mm: number) => fmt.format(new Date(2000, 0, 1, hh, mm));
  const periodNames = (() => {
    const parts = (d: Date) =>
      new Intl.DateTimeFormat(l, { hour: 'numeric', hour12: true }).formatToParts(d).find((p) => p.type === 'dayPeriod')?.value;
    return [parts(new Date(2000, 0, 1, 9)) ?? 'AM', parts(new Date(2000, 0, 1, 15)) ?? 'PM'];
  })();

  const focus = (s: Seg) => refs[s].current?.focus();

  const onKey = (e: KeyboardEvent, seg: Seg) => {
    const k = e.key;
    if (k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault();
      const d = k === 'ArrowUp' ? 1 : -1;
      if (seg === 'h') emit(((h ?? (d > 0 ? -1 : 0)) + d + 24) % 24, m ?? 0);
      else if (seg === 'm') {
        const base = m ?? 0;
        const next = d > 0 ? Math.floor(base / step) * step + step : Math.ceil(base / step) * step - step;
        emit(h ?? (twelve ? (pm ? 12 : 0) : 0), ((next % 60) + 60) % 60);
      } else emit(h == null ? (pm ? 0 : 12) : (h + 12) % 24, m ?? 0);
      typed.current = '';
      return;
    }
    if (k === 'ArrowRight' || k === 'ArrowLeft') {
      e.preventDefault();
      const order: Seg[] = twelve ? ['h', 'm', 'p'] : ['h', 'm'];
      const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
      const i = order.indexOf(seg) + ((k === 'ArrowRight') !== rtl ? 1 : -1);
      if (order[i]) focus(order[i]);
      typed.current = '';
      return;
    }
    if (k === 'Backspace' || k === 'Delete') {
      e.preventDefault();
      if (seg === 'h') emit(null, m);
      else if (seg === 'm') emit(h, null);
      typed.current = '';
      return;
    }
    if (seg === 'p') {
      const first = k.toLowerCase();
      if (first === periodNames[0][0].toLowerCase() || first === 'a') {
        e.preventDefault();
        if (h != null && h >= 12) emit(h - 12, m);
        else setPm(false);
      } else if (first === periodNames[1][0].toLowerCase() || first === 'p') {
        e.preventDefault();
        if (h != null && h < 12) emit(h + 12, m);
        else setPm(true);
      }
      return;
    }
    if (/^\d$/.test(k)) {
      e.preventDefault();
      const buf = typed.current + k;
      const n = Number(buf);
      if (seg === 'h') {
        const maxH = twelve ? 12 : 23;
        const to24 = (x: number) => (twelve ? (x % 12) + (pm ? 12 : 0) : x);
        if (buf.length === 2 || n * 10 > maxH) {
          const v = n > maxH ? Number(k) : n;
          if (!(twelve && v === 0)) emit(to24(v), m);
          typed.current = '';
          focus('m');
        } else {
          if (!(twelve && n === 0)) emit(to24(n), m);
          typed.current = buf;
        }
      } else {
        if (buf.length === 2 || n > 5) {
          emit(h ?? (twelve ? (pm ? 12 : 0) : 0), Math.min(59, n));
          typed.current = '';
          if (buf.length === 2 && twelve) focus('p');
        } else {
          emit(h ?? (twelve ? (pm ? 12 : 0) : 0), n);
          typed.current = buf;
        }
      }
    }
  };

  const segProps = (seg: Seg, now: number | null, min: number, max: number, text: string) => ({
    ref: refs[seg],
    role: 'spinbutton',
    tabIndex: c.disabled ? -1 : 0,
    className: cx('time-seg', now == null && seg !== 'p' && 'is-empty'),
    'aria-label': seg === 'h' ? 'Hours' : seg === 'm' ? 'Minutes' : 'AM or PM',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': now ?? undefined,
    'aria-valuetext': text,
    'aria-disabled': c.disabled || undefined,
    onKeyDown: (e: KeyboardEvent) => !c.disabled && onKey(e, seg),
    onFocus: () => (typed.current = ''),
  });

  const options: string[] = [];
  if (listStep > 0) {
    const a = parse(listFrom);
    const b = parse(listTo);
    for (let t = (a.h ?? 0) * 60 + (a.m ?? 0); t <= (b.h ?? 23) * 60 + (b.m ?? 59); t += listStep)
      options.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }

  return (
    <div
      className={cx('control', 'time-field', `control-${size}`, c.invalid && 'is-invalid', c.disabled && 'is-disabled')}
      role="group"
      aria-label={h != null && m != null ? `${label}: ${asText(h, m)}` : label}
      aria-describedby={c['aria-describedby']}
      aria-invalid={c['aria-invalid']}
      id={c.id}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onBlur?.();
      }}
    >
      <span className="time-segs" dir="ltr">
        <span {...segProps('h', displayHour, twelve ? 1 : 0, twelve ? 12 : 23, displayHour == null ? 'Empty' : String(displayHour))}>
          {displayHour == null ? '--' : twelve ? displayHour : pad(displayHour)}
        </span>
        <span className="time-colon" aria-hidden="true">
          :
        </span>
        <span {...segProps('m', m, 0, 59, m == null ? 'Empty' : pad(m))}>{m == null ? '--' : pad(m)}</span>
        {twelve && (
          <span {...segProps('p', pm ? 1 : 0, 0, 1, pm ? periodNames[1] : periodNames[0])} className="time-seg is-period">
            {pm ? periodNames[1] : periodNames[0]}
          </span>
        )}
      </span>
      {options.length > 0 && (
        <Popover
          label={`${label}: choose a time`}
          className="time-pop"
          align="end"
          width={150}
          initialFocus=".time-option[aria-selected='true'], .time-option"
          trigger={
            <button type="button" className="time-list-btn" disabled={c.disabled} aria-label={`Choose ${label.toLowerCase()} from a list`}>
              <Clock size={15} />
            </button>
          }
        >
          {(close) => (
            <ul
              className="time-options"
              role="listbox"
              aria-label="Times"
              ref={(el) => el?.querySelector<HTMLElement>("[aria-selected='true']")?.scrollIntoView({ block: 'center' })}
            >
              {options.map((o) => {
                const p = parse(o);
                const on = o === time;
                return (
                  <li key={o} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={cx('time-option', on && 'is-on')}
                      onClick={() => {
                        emit(p.h, p.m);
                        close();
                        focus('h');
                      }}
                      onKeyDown={(e) => {
                        const list = [...(e.currentTarget.closest('ul')?.querySelectorAll<HTMLButtonElement>('.time-option') ?? [])];
                        const i = list.indexOf(e.currentTarget);
                        const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[e.key];
                        if (to != null && list[to]) {
                          e.preventDefault();
                          list[to].focus();
                        }
                      }}
                    >
                      {asText(p.h ?? 0, p.m ?? 0)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Popover>
      )}
    </div>
  );
}
