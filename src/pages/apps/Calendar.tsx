import { useMemo, useState, type CSSProperties } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Calendar as MiniCalendar,
  Checkbox,
  DatePicker,
  Field,
  Input,
  Modal,
  PageHeader,
  Scheduler,
  Select,
  Switch,
  Textarea,
  TimePicker,
  useToast,
  type SchedulerView,
} from '../../components/kit';
import { CALENDARS, EVENTS, type AppEvent } from './data';
import { SampleBadge } from './shared';

/* Calendar: month and week views, calendars you can hide, a mini month to jump around, and an
 * event dialog for adding, editing and deleting. */

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const ymdOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s));

interface Draft {
  id?: string;
  title: string;
  calendar: string;
  date: Date;
  endDate: Date;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  notes: string;
}
const toDraft = (e: AppEvent): Draft => {
  const s = parse(e.start);
  const en = parse(e.end);
  return {
    id: e.id,
    title: e.title,
    calendar: e.calendar,
    date: s,
    endDate: e.allDay ? new Date(+en - 86_400_000) : en,
    start: hhmm(s),
    end: hhmm(en),
    allDay: !!e.allDay,
    location: e.location ?? '',
    notes: e.notes ?? '',
  };
};
const fromDraft = (d: Draft): AppEvent => {
  const at = (day: Date, t: string) => {
    const [h, m] = t.split(':').map(Number);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).toISOString();
  };
  return {
    id: d.id ?? `ev${Date.now()}`,
    title: d.title.trim(),
    calendar: d.calendar,
    allDay: d.allDay,
    start: d.allDay ? ymdOf(d.date) : at(d.date, d.start),
    end: d.allDay ? ymdOf(new Date(d.endDate.getFullYear(), d.endDate.getMonth(), d.endDate.getDate() + 1)) : at(d.date, d.end),
    location: d.location || undefined,
    notes: d.notes || undefined,
  };
};

export default function CalendarPage() {
  const toast = useToast();
  const [events, setEvents] = useState(EVENTS);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<SchedulerView>('week');
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Draft | null>(null);

  const colour = (id: string) => CALENDARS.find((c) => c.id === id)?.color;
  const shown = useMemo(
    () => events.filter((e) => !hidden.has(e.calendar)).map((e) => ({ ...e, color: colour(e.calendar) })),
    [events, hidden],
  );
  const upcoming = useMemo(
    () =>
      events
        .filter((e) => parse(e.end) > new Date())
        .sort((a, b) => +parse(a.start) - +parse(b.start))
        .slice(0, 4),
    [events],
  );

  const newAt = (start: Date, allDay: boolean) =>
    setDraft({
      title: '',
      calendar: 'work',
      date: start,
      endDate: start,
      start: allDay ? '09:00' : hhmm(start),
      end: allDay ? '10:00' : hhmm(new Date(+start + 3_600_000)),
      allDay,
      location: '',
      notes: '',
    });

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Meetings, launches and time off for the team."
        actions={
          <>
            <SampleBadge />
            <Button
              variant="primary"
              iconStart={<Plus size={16} />}
              onClick={() => newAt(new Date(new Date().setMinutes(0, 0, 0) + 3_600_000), false)}
            >
              New event
            </Button>
          </>
        }
      />
      <div className="cal-app">
        <aside className="cal-side" aria-label="Calendars">
          <div className="card cal-mini">
            <MiniCalendar
              mode="single"
              weekStartsOn={1}
              selected={date}
              month={date}
              onMonthChange={setDate}
              onSelect={(d: Date | undefined) => d && setDate(d)}
            />
          </div>
          <div className="card cal-list">
            <h2 className="app-side-title">My calendars</h2>
            {CALENDARS.map((c) => (
              <div key={c.id} className="cal-check" style={{ '--cal': c.color } as CSSProperties}>
                <Checkbox
                  label={c.label}
                  checked={!hidden.has(c.id)}
                  onChange={(on) =>
                    setHidden((h) => {
                      const n = new Set(h);
                      if (on) n.delete(c.id);
                      else n.add(c.id);
                      return n;
                    })
                  }
                />
                <span className="cal-swatch" aria-hidden="true" />
              </div>
            ))}
          </div>
          <div className="card cal-list">
            <h2 className="app-side-title">Coming up</h2>
            <ul className="cal-upcoming">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => setDraft(toDraft(e))}>
                    <span className="cal-swatch" style={{ background: colour(e.calendar) }} aria-hidden="true" />
                    <span>
                      <b>{e.title}</b>
                      <small className="muted">
                        {parse(e.start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {!e.allDay && ` · ${parse(e.start).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="card cal-main">
          <Scheduler
            events={shown}
            date={date}
            onDateChange={setDate}
            view={view}
            onViewChange={setView}
            onEventClick={(e) => setDraft(toDraft(events.find((x) => x.id === e.id)!))}
            onSlotClick={newAt}
            onEventMove={(e, start, end) => {
              setEvents((l) =>
                l.map((x) =>
                  x.id === e.id
                    ? { ...x, start: x.allDay ? ymdOf(start) : start.toISOString(), end: x.allDay ? ymdOf(end) : end.toISOString() }
                    : x,
                ),
              );
              toast.ok(
                `${e.title} moved`,
                start.toLocaleString(
                  undefined,
                  e.allDay ? { weekday: 'long', month: 'long', day: 'numeric' } : { weekday: 'long', hour: 'numeric', minute: '2-digit' },
                ),
              );
            }}
          />
        </div>
      </div>
      {draft && (
        <EventDialog
          draft={draft}
          onClose={() => setDraft(null)}
          onSave={(d) => {
            const ev = fromDraft(d);
            setEvents((l) => (d.id ? l.map((x) => (x.id === d.id ? ev : x)) : [...l, ev]));
            setDraft(null);
            setDate(d.date);
            toast.ok(d.id ? 'Event saved' : 'Event added');
          }}
          onDelete={() => {
            setEvents((l) => l.filter((x) => x.id !== draft.id));
            setDraft(null);
            toast.ok('Event deleted');
          }}
        />
      )}
    </>
  );
}

function EventDialog({
  draft,
  onClose,
  onSave,
  onDelete,
}: {
  draft: Draft;
  onClose: () => void;
  onSave: (d: Draft) => void;
  onDelete: () => void;
}) {
  const [d, setD] = useState(draft);
  const [errors, setErrors] = useState<{ title?: string; end?: string }>({});
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((o) => ({ ...o, [k]: v }));
  const submit = () => {
    const e: typeof errors = {};
    if (!d.title.trim()) e.title = 'Give the event a title.';
    if (!d.allDay && d.end <= d.start) e.end = 'End after the start time.';
    if (d.allDay && d.endDate < d.date) e.end = 'End on or after the first day.';
    setErrors(e);
    if (!Object.keys(e).length) onSave(d);
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={d.id ? 'Edit event' : 'New event'}
      footer={
        <>
          {d.id && (
            <Button variant="ghost" iconStart={<Trash2 size={15} />} onClick={onDelete} style={{ marginInlineEnd: 'auto' }}>
              Delete
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            {d.id ? 'Save' : 'Add event'}
          </Button>
        </>
      }
    >
      <form
        className="app-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Title" required error={errors.title}>
          <Input value={d.title} onChange={(e) => set('title', e.target.value)} autoFocus placeholder="e.g. Design review" />
        </Field>
        <Switch checked={d.allDay} onChange={(v) => set('allDay', v)} label="All day" />
        {d.allDay ? (
          <div className="app-form-row">
            <Field label="From">
              <DatePicker value={d.date} onChange={(v) => v && set('date', v)} />
            </Field>
            <Field label="To" error={errors.end}>
              <DatePicker value={d.endDate} onChange={(v) => v && set('endDate', v)} />
            </Field>
          </div>
        ) : (
          <>
            <Field label="Date">
              <DatePicker value={d.date} onChange={(v) => v && set('date', v)} />
            </Field>
            <div className="app-form-row">
              <Field label="Starts">
                <TimePicker value={d.start} onChange={(v) => v && set('start', v)} listStep={30} />
              </Field>
              <Field label="Ends" error={errors.end}>
                <TimePicker value={d.end} onChange={(v) => v && set('end', v)} listStep={30} />
              </Field>
            </div>
          </>
        )}
        <div className="app-form-row">
          <Field label="Calendar">
            <Select
              value={d.calendar}
              onChange={(v) => set('calendar', v)}
              options={CALENDARS.map((c) => ({ value: c.id, label: c.label }))}
            />
          </Field>
          <Field label="Location">
            <Input value={d.location} onChange={(e) => set('location', e.target.value)} placeholder="Room, address or link" />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={d.notes} onChange={(e) => set('notes', e.target.value)} autosize minRows={2} />
        </Field>
      </form>
    </Modal>
  );
}
