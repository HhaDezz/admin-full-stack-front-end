import { useState } from 'react';
import { Scheduler, useToast, type SchedulerEvent } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './Scheduler.tsx?raw';

// #region calendar
/** Events around today, so the sample never looks stale. */
const at = (dayOffset: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const EVENTS: SchedulerEvent[] = [
  { id: 'e1', title: 'Stand-up', start: at(0, 9, 30), end: at(0, 9, 45), color: 'var(--chart-2)' },
  { id: 'e2', title: 'Design review', start: at(0, 11), end: at(0, 12), location: 'Room 2', color: 'var(--chart-4)' },
  { id: 'e3', title: 'Lunch with suppliers', start: at(0, 11, 30), end: at(0, 13), color: 'var(--chart-3)' },
  { id: 'e4', title: 'Quarterly planning', start: at(1, 14), end: at(1, 16, 30), location: 'Boardroom', color: 'var(--chart-1)' },
  { id: 'e5', title: 'Trade fair', start: day(3), end: day(5), allDay: true, color: 'var(--chart-5)' },
  { id: 'e6', title: 'Payroll run', start: at(-2, 15), end: at(-2, 16), color: 'var(--chart-6)' },
  { id: 'e7', title: 'Photo shoot', start: at(6, 10), end: at(6, 15), color: 'var(--chart-4)' },
];

export function Calendar() {
  const toast = useToast();
  const [events, setEvents] = useState(EVENTS);
  return (
    <Scheduler
      events={events}
      defaultView="week"
      onEventClick={(e) => toast.info(e.title)}
      onSlotClick={(start, allDay) =>
        setEvents((list) => [
          ...list,
          {
            id: `n${Date.now()}`,
            title: 'New event',
            start: allDay ? start.toISOString().slice(0, 10) : start.toISOString(),
            end: new Date(+start + (allDay ? 86_400_000 : 3_600_000)).toISOString(),
            allDay,
          },
        ])
      }
      onEventMove={(e, start, end) =>
        setEvents((list) => list.map((x) => (x.id === e.id ? { ...x, start: start.toISOString(), end: end.toISOString() } : x)))
      }
    />
  );
}
// #endregion

export default defineDoc({
  name: 'Scheduler',
  group: 'Apps & advanced',
  status: 'new',
  description:
    'A calendar of events with month and week views. Overlapping events sit side by side, a red line marks the time now, and with a mouse you can drag events to another day or time.',
  imports: ['Scheduler', 'type SchedulerEvent'],
  raw,
  examples: [
    {
      id: 'calendar',
      title: 'Team calendar',
      description:
        'Switch between Week and Month. Click an empty time to add an event, drag one to move it (snaps to 15 minutes). “+2 more” in a month opens that week.',
      Component: Calendar,
    },
  ],
  keyboard: [
    ['Tab', 'Toolbar, then each event in order'],
    ['Enter / Space', 'Open the focused event (onEventClick)'],
  ],
  a11y: [
    'The month is a table with weekday headers; each day has its full date for screen readers.',
    'Every event is a button named with its title, date and times (“Design review, Monday 3 March, 11:00 to 12:00”).',
    'The title (“March 2026”) is a live region, so Previous and Next are announced.',
    'Dragging is a mouse shortcut. Give people another way to move an event, such as editing its date in the dialog onEventClick opens.',
  ],
  props: [
    { name: 'events', type: 'SchedulerEvent[]', description: '{ id, title, start, end, allDay?, color?, location? } — ISO strings.' },
    { name: 'view / defaultView / onViewChange', type: "'month' | 'week'", defaultValue: "'month'", description: 'Which view.' },
    { name: 'date / defaultDate / onDateChange', type: 'Date', defaultValue: 'today', description: 'Any day in the period shown.' },
    { name: 'onEventClick', type: '(event) => void', description: 'Open or edit an event.' },
    { name: 'onSlotClick', type: '(start, allDay) => void', description: 'Click an empty day or time.' },
    { name: 'onEventMove', type: '(event, start, end) => void', description: 'Drag to reschedule; leave out to turn dragging off.' },
    { name: 'weekStartsOn', type: '0 | 1', defaultValue: '1', description: 'Sunday or Monday.' },
    { name: 'hours', type: '[number, number]', defaultValue: '[7, 21]', description: 'Hours shown in the week view.' },
    { name: 'toolbar', type: 'ReactNode', description: 'Extra buttons, e.g. “New event”.' },
  ],
});
