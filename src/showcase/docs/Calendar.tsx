import { useState } from 'react';
import { Calendar } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Calendar.tsx?raw';

// #region single
export function Single() {
  const [day, setDay] = useState<Date | undefined>(new Date());
  return (
    <div className="ex-col" style={{ alignItems: 'flex-start' }}>
      <div className="card" style={{ padding: 8 }}>
        <Calendar mode="single" selected={day} onSelect={setDay} />
      </div>
      <span className="muted">{day ? day.toDateString() : 'No day chosen'}</span>
    </div>
  );
}
// #endregion

// #region rules
export function Rules() {
  const today = new Date();
  const in60 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);
  return (
    <div className="ex-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div className="card" style={{ padding: 8 }}>
        <Calendar
          mode="single"
          aria-label="Weekdays in the next 60 days"
          disabled={[{ before: today }, { after: in60 }, { dayOfWeek: [0, 6] }]}
        />
      </div>
      <div className="card" style={{ padding: 8 }}>
        <Calendar mode="single" lang="fr" aria-label="Calendrier" />
      </div>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Calendar',
  group: 'Date & time',
  status: 'new',
  description:
    'A month grid built on react-day-picker and styled by the theme. Single days, ranges or many days, rules for disabled dates, and month names in the user’s language.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'mode', options: ['single', 'range', 'multiple'], default: 'single' },
      { type: 'number', name: 'numberOfMonths', default: 1, min: 1, max: 2 },
      { type: 'select', name: 'lang', options: ['en-US', 'en-GB', 'fr', 'de', 'ar', 'ja'], default: 'en-US' },
      { type: 'boolean', name: 'showOutsideDays', default: true },
      { type: 'boolean', name: 'showWeekNumber', default: false },
    ],
    render: (v) => (
      <div className="card" style={{ padding: 8 }} dir={v.lang === 'ar' ? 'rtl' : undefined}>
        <Calendar
          key={String(v.mode)}
          mode={v.mode as 'single'}
          numberOfMonths={Number(v.numberOfMonths)}
          lang={String(v.lang)}
          showOutsideDays={!!v.showOutsideDays}
          showWeekNumber={!!v.showWeekNumber}
        />
      </div>
    ),
    code: (p) =>
      jsx('Calendar', p, { mode: '', numberOfMonths: 1, lang: 'en-US', showOutsideDays: true, showWeekNumber: false }, undefined, [
        'selected={selected}',
        'onSelect={setSelected}',
      ]),
  },
  examples: [
    { id: 'single', title: 'Pick a day', description: 'mode="single" with selected and onSelect.', Component: Single },
    {
      id: 'rules',
      title: 'Disabled dates and other languages',
      description:
        'disabled takes matchers ({ before }, { after }, { dayOfWeek }, a date, a function). lang sets month names and the first day of the week.',
      Component: Rules,
    },
  ],
  keyboard: [
    ['Arrow keys', 'Previous or next day / week'],
    ['PageUp / PageDown', 'Previous or next month'],
    ['Shift + PageUp / PageDown', 'Previous or next year'],
    ['Home / End', 'Start or end of the week'],
    ['Enter / Space', 'Choose the focused day'],
  ],
  a11y: [
    'A grid with labelled days (“Tuesday, October 27, 2026, selected”), from react-day-picker.',
    'The month changes in a polite live region.',
    'Disabled days are skipped by the keyboard and marked aria-disabled.',
  ],
  props: [
    { name: 'mode', type: "'single' | 'range' | 'multiple'", description: 'What can be selected.' },
    { name: 'selected / onSelect', type: 'Date | DateRange | Date[]', description: 'The selection, typed by mode.' },
    { name: 'disabled', type: 'Matcher | Matcher[]', description: 'Days that can’t be chosen.' },
    { name: 'numberOfMonths', type: 'number', defaultValue: '1', description: 'Months side by side.' },
    { name: 'lang', type: 'string', defaultValue: 'the page’s', description: 'Language for names and week start.' },
    { name: 'captionLayout', type: "'label' | 'dropdown'", defaultValue: "'label'", description: 'Month and year dropdowns.' },
    { name: '…', type: 'DayPickerProps', description: 'Everything else from react-day-picker.' },
  ],
});
