import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx, useControllable } from './utils';

/* ── Scheduler: a calendar of events with month and week views, a now line and drag to reschedule ── */

export type SchedulerView = 'month' | 'week';

export interface SchedulerEvent {
  id: string;
  title: string;
  /** ISO date-time (or date for all-day events). */
  start: string;
  end: string;
  allDay?: boolean;
  /** Any CSS colour; default the brand colour. */
  color?: string;
  /** Small second line in the week view, e.g. a room. */
  location?: string;
}

export interface SchedulerProps {
  events: SchedulerEvent[];
  view?: SchedulerView;
  defaultView?: SchedulerView;
  onViewChange?: (v: SchedulerView) => void;
  /** Any day in the month or week shown. */
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (d: Date) => void;
  onEventClick?: (e: SchedulerEvent) => void;
  /** Clicking an empty day or time: the slot's start. */
  onSlotClick?: (start: Date, allDay: boolean) => void;
  /** Drag an event to another day or time (mouse). Leave out to turn dragging off. */
  onEventMove?: (e: SchedulerEvent, start: Date, end: Date) => void;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /** First and last hour in the week view. */
  hours?: [number, number];
  /** Extra buttons in the toolbar. */
  toolbar?: ReactNode;
  className?: string;
}

const HOUR_PX = 48;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const startOfWeek = (d: Date, ws: number) => addDays(startOfDay(d), -((d.getDay() - ws + 7) % 7));
const parse = (s: string) => {
  // A bare date is local midnight, not UTC.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s);
};
const fmtTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtHour = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString(undefined, { hour: 'numeric' });

/** Does the event touch this day? An end at midnight doesn't count that day. */
function covers(p: { s: Date; en: Date }, d: Date) {
  const last = +p.en === +startOfDay(p.en) && +p.en > +p.s ? addDays(p.en, -1) : p.en;
  return +startOfDay(p.s) <= +d && +d <= +startOfDay(last);
}

interface Placed {
  e: SchedulerEvent;
  s: Date;
  en: Date;
  col: number;
  cols: number;
}

/** Side-by-side columns for events that overlap on one day. */
function layoutDay(list: { e: SchedulerEvent; s: Date; en: Date }[]): Placed[] {
  const sorted = [...list].sort((a, b) => +a.s - +b.s || +b.en - +a.en);
  const out: Placed[] = [];
  let cluster: Placed[] = [];
  let clusterEnd = 0;
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((p) => p.col + 1));
    cluster.forEach((p) => (p.cols = cols));
    out.push(...cluster);
    cluster = [];
  };
  for (const it of sorted) {
    if (cluster.length && +it.s >= clusterEnd) flush();
    const used = new Set(cluster.filter((p) => +p.en > +it.s).map((p) => p.col));
    let col = 0;
    while (used.has(col)) col++;
    cluster.push({ ...it, col, cols: 1 });
    clusterEnd = Math.max(clusterEnd, +it.en);
  }
  if (cluster.length) flush();
  return out;
}

export function Scheduler({
  events,
  view: viewProp,
  defaultView = 'month',
  onViewChange,
  date: dateProp,
  defaultDate,
  onDateChange,
  onEventClick,
  onSlotClick,
  onEventMove,
  weekStartsOn = 1,
  hours = [7, 21],
  toolbar,
  className,
}: SchedulerProps) {
  const [view, setView] = useControllable(viewProp, defaultView, onViewChange);
  const [date, setDate] = useControllable(dateProp, defaultDate ?? new Date(), onDateChange);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const parsed = useMemo(() => events.map((e) => ({ e, s: parse(e.start), en: parse(e.end) })), [events]);

  const step = (d: number) => {
    if (view === 'month') {
      // Land on today when it's in that month, so switching to Week shows this week.
      const next = new Date(date.getFullYear(), date.getMonth() + d, 1);
      const t = new Date();
      setDate(t.getFullYear() === next.getFullYear() && t.getMonth() === next.getMonth() ? startOfDay(t) : next);
    } else setDate(addDays(date, 7 * d));
  };

  const weekStart = startOfWeek(date, weekStartsOn);
  const title =
    view === 'month'
      ? date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : (() => {
          const end = addDays(weekStart, 6);
          const sameMonth = end.getMonth() === weekStart.getMonth();
          return `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, sameMonth ? { day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' })}`;
        })();

  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Dragging (mouse): carry the event id and where in it you grabbed.
  const dragging = useRef<{ id: string; offsetMin: number } | null>(null);
  const drop = (target: Date, allDay: boolean) => {
    const d = dragging.current;
    dragging.current = null;
    const p = parsed.find((x) => x.e.id === d?.id);
    if (!p || !onEventMove || !d) return;
    const len = +p.en - +p.s;
    let start: Date;
    if (allDay || p.e.allDay) {
      // Keep the time of day; change the date.
      start = new Date(target.getFullYear(), target.getMonth(), target.getDate(), p.s.getHours(), p.s.getMinutes());
    } else {
      start = new Date(+target - d.offsetMin * 60_000);
      start.setMinutes(Math.round(start.getMinutes() / 15) * 15, 0, 0);
    }
    if (+start !== +p.s) onEventMove(p.e, start, new Date(+start + len));
  };
  const dragProps = (e: SchedulerEvent) =>
    onEventMove
      ? {
          draggable: true,
          onDragStart: (ev: DragEvent<HTMLElement>) => {
            const rect = ev.currentTarget.getBoundingClientRect();
            const offsetMin = view === 'week' && !e.allDay ? Math.round(((ev.clientY - rect.top) / HOUR_PX) * 60) : 0;
            dragging.current = { id: e.id, offsetMin };
            ev.dataTransfer.effectAllowed = 'move';
            ev.dataTransfer.setData('text/plain', e.title);
          },
        }
      : {};
  const dropProps = (target: (ev: DragEvent<HTMLElement>) => Date, allDay: boolean) =>
    onEventMove
      ? {
          onDragOver: (ev: DragEvent<HTMLElement>) => {
            if (!dragging.current) return;
            ev.preventDefault();
            ev.currentTarget.classList.add('is-drop');
          },
          onDragLeave: (ev: DragEvent<HTMLElement>) => ev.currentTarget.classList.remove('is-drop'),
          onDrop: (ev: DragEvent<HTMLElement>) => {
            ev.preventDefault();
            ev.currentTarget.classList.remove('is-drop');
            drop(target(ev), allDay);
          },
        }
      : {};

  const eventLabel = (p: { e: SchedulerEvent; s: Date; en: Date }) =>
    p.e.allDay
      ? `${p.e.title}, all day`
      : `${p.e.title}, ${p.s.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}, ${fmtTime(p.s)} to ${fmtTime(p.en)}`;
  const colorStyle = (e: SchedulerEvent) => ({ '--ev': e.color ?? 'var(--brand)' }) as CSSProperties;

  return (
    <div className={cx('sched', `is-${view}`, className)}>
      <div className="sched-bar">
        <div className="sched-nav">
          <button type="button" className="btn btn-sm" onClick={() => setDate(new Date())}>
            Today
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => step(-1)}
            aria-label={view === 'month' ? 'Previous month' : 'Previous week'}
          >
            <ChevronLeft size={16} className="flip-rtl" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => step(1)}
            aria-label={view === 'month' ? 'Next month' : 'Next week'}
          >
            <ChevronRight size={16} className="flip-rtl" />
          </button>
          <h2 className="sched-title" aria-live="polite">
            {title}
          </h2>
        </div>
        <div className="sched-tools">
          {toolbar}
          <div className="seg" role="group" aria-label="View">
            {(['month', 'week'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={cx('seg-btn', view === v && 'is-on')}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === 'month' ? 'Month' : 'Week'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'month' ? (
        <MonthView
          date={date}
          weekStart={weekStart}
          weekStartsOn={weekStartsOn}
          parsed={parsed}
          now={now}
          onEventClick={onEventClick}
          onSlotClick={onSlotClick}
          onMore={(d) => {
            setDate(d);
            setView('week');
          }}
          dragProps={dragProps}
          dropProps={dropProps}
          eventLabel={eventLabel}
          colorStyle={colorStyle}
        />
      ) : (
        <div className="sched-week-wrap">
          <div className="sched-week" style={{ '--hours': hours[1] - hours[0], '--hour': `${HOUR_PX}px` } as CSSProperties}>
            <div className="sched-week-head">
              <span className="sched-gutter" />
              {weekdays.map((d) => (
                <div key={+d} className={cx('sched-wd', sameDay(d, now) && 'is-today')}>
                  <span>{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                  <b>{d.getDate()}</b>
                </div>
              ))}
            </div>
            <div className="sched-allday">
              <span className="sched-gutter">All day</span>
              {weekdays.map((d) => {
                const list = parsed.filter((p) => p.e.allDay && covers(p, d));
                return (
                  <div
                    key={+d}
                    className="sched-allday-cell"
                    onClick={(ev) => ev.target === ev.currentTarget && onSlotClick?.(d, true)}
                    {...dropProps(() => d, true)}
                  >
                    {list.map((p) => (
                      <button
                        key={p.e.id}
                        type="button"
                        className="sched-ev is-allday"
                        style={colorStyle(p.e)}
                        aria-label={eventLabel(p)}
                        onClick={() => onEventClick?.(p.e)}
                        {...dragProps(p.e)}
                      >
                        {p.e.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="sched-grid">
              <div className="sched-hours" aria-hidden="true">
                {Array.from({ length: hours[1] - hours[0] }, (_, i) => (
                  <span key={i}>{fmtHour(hours[0] + i)}</span>
                ))}
              </div>
              {weekdays.map((d) => {
                const dayList = parsed.filter((p) => !p.e.allDay && sameDay(p.s, d));
                const placed = layoutDay(dayList);
                const nowTop = ((now.getHours() - hours[0]) * 60 + now.getMinutes()) * (HOUR_PX / 60);
                const slotAt = (ev: DragEvent<HTMLElement> | MouseEvent<HTMLElement>) => {
                  const rect = ev.currentTarget.getBoundingClientRect();
                  const mins = Math.max(0, Math.round((((ev.clientY - rect.top) / HOUR_PX) * 60) / 15) * 15);
                  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours[0], mins);
                };
                return (
                  <div
                    key={+d}
                    className={cx('sched-day', sameDay(d, now) && 'is-today')}
                    onClick={(ev) => ev.target === ev.currentTarget && onSlotClick?.(slotAt(ev), false)}
                    {...dropProps(slotAt, false)}
                  >
                    {placed.map((p) => {
                      const top = ((p.s.getHours() - hours[0]) * 60 + p.s.getMinutes()) * (HOUR_PX / 60);
                      const h = Math.max(20, ((+p.en - +p.s) / 60_000) * (HOUR_PX / 60));
                      return (
                        <button
                          key={p.e.id}
                          type="button"
                          className={cx('sched-ev is-timed', h < 36 && 'is-short')}
                          style={{
                            ...colorStyle(p.e),
                            top,
                            height: h - 2,
                            insetInlineStart: `calc(${(p.col / p.cols) * 100}% + 2px)`,
                            width: `calc(${100 / p.cols}% - 4px)`,
                          }}
                          aria-label={eventLabel(p)}
                          onClick={() => onEventClick?.(p.e)}
                          {...dragProps(p.e)}
                        >
                          <b>{p.e.title}</b>
                          <span>
                            {fmtTime(p.s)}
                            {p.e.location && ` · ${p.e.location}`}
                          </span>
                        </button>
                      );
                    })}
                    {sameDay(d, now) && nowTop >= 0 && nowTop <= (hours[1] - hours[0]) * HOUR_PX && (
                      <span className="sched-now" style={{ top: nowTop }} aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthView({
  date,
  weekStartsOn,
  parsed,
  now,
  onEventClick,
  onSlotClick,
  onMore,
  dragProps,
  dropProps,
  eventLabel,
  colorStyle,
}: {
  date: Date;
  weekStart: Date;
  weekStartsOn: number;
  parsed: { e: SchedulerEvent; s: Date; en: Date }[];
  now: Date;
  onEventClick?: (e: SchedulerEvent) => void;
  onSlotClick?: (d: Date, allDay: boolean) => void;
  onMore: (d: Date) => void;
  dragProps: (e: SchedulerEvent) => object;
  dropProps: (t: () => Date, allDay: boolean) => object;
  eventLabel: (p: { e: SchedulerEvent; s: Date; en: Date }) => string;
  colorStyle: (e: SchedulerEvent) => CSSProperties;
}) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = startOfWeek(first, weekStartsOn);
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)));
  const MAX = 3;
  return (
    <table className="sched-month">
      <caption className="sr-only">{date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</caption>
      <thead>
        <tr>
          {weeks[0].map((d) => (
            <th key={+d} scope="col">
              <abbr title={d.toLocaleDateString(undefined, { weekday: 'long' })}>
                {d.toLocaleDateString(undefined, { weekday: 'short' })}
              </abbr>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, w) => (
          <tr key={w}>
            {week.map((d) => {
              const day = parsed.filter((p) => covers(p, d)).sort((a, b) => Number(!!b.e.allDay) - Number(!!a.e.allDay) || +a.s - +b.s);
              const out = d.getMonth() !== date.getMonth();
              return (
                <td key={+d} className={cx(out && 'is-out', sameDay(d, now) && 'is-today')} {...dropProps(() => d, true)}>
                  <div className="sched-cell" onClick={(ev) => ev.target === ev.currentTarget && onSlotClick?.(d, true)}>
                    <span className="sched-date">
                      <span className="sr-only">{d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      <span aria-hidden="true">{d.getDate()}</span>
                    </span>
                    {day.slice(0, MAX).map((p) => (
                      <button
                        key={p.e.id}
                        type="button"
                        className={cx('sched-ev', p.e.allDay ? 'is-allday' : 'is-dot')}
                        style={colorStyle(p.e)}
                        aria-label={eventLabel(p)}
                        onClick={() => onEventClick?.(p.e)}
                        {...dragProps(p.e)}
                      >
                        {!p.e.allDay && <time>{fmtTime(p.s)}</time>}
                        <span>{p.e.title}</span>
                      </button>
                    ))}
                    {day.length > MAX && (
                      <button type="button" className="sched-more" onClick={() => onMore(d)}>
                        +{day.length - MAX} more
                      </button>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
