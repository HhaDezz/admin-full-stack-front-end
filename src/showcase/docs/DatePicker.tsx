import { useState } from 'react';
import { DatePicker, Field } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './DatePicker.tsx?raw';

// #region basic
export function Basic() {
  const [date, setDate] = useState<Date | null>(null);
  const today = new Date();
  return (
    <div className="ex-col">
      <Field label="Start date" hint="Weekdays from today.">
        <DatePicker value={date} onChange={setDate} min={today} disabledDates={{ dayOfWeek: [0, 6] }} />
      </Field>
    </div>
  );
}
// #endregion

// #region birthday
export function Birthday() {
  return (
    <div className="ex-col">
      <Field label="Date of birth">
        <DatePicker dropdowns max={new Date()} format={{ day: 'numeric', month: 'long', year: 'numeric' }} placeholder="Choose a date" />
      </Field>
      <Field label="Disabled">
        <DatePicker defaultValue={new Date(2026, 0, 15)} disabled />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'DatePicker',
  group: 'Date & time',
  status: 'new',
  description:
    'A date field that opens a Calendar. Earliest and latest dates, rules for unavailable days, month/year dropdowns and a clear button.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'dropdowns', default: false },
      { type: 'boolean', name: 'clearable', default: true },
      { type: 'boolean', name: 'invalid', default: false },
      { type: 'boolean', name: 'disabled', default: false },
      { type: 'text', name: 'placeholder', default: 'Pick a date' },
    ],
    render: (v) => (
      <div style={{ width: 'min(280px, 100%)' }}>
        <DatePicker
          aria-label="Playground date"
          size={v.size as 'md'}
          dropdowns={!!v.dropdowns}
          clearable={!!v.clearable}
          invalid={!!v.invalid}
          disabled={!!v.disabled}
          placeholder={String(v.placeholder)}
        />
      </div>
    ),
    code: (p) =>
      jsx(
        'DatePicker',
        p,
        { size: 'md', dropdowns: false, clearable: true, invalid: false, disabled: false, placeholder: 'Pick a date' },
        undefined,
        ['value={date}', 'onChange={setDate}'],
      ),
  },
  examples: [
    { id: 'basic', title: 'With limits', description: 'min, max and disabledDates (any react-day-picker matcher).', Component: Basic },
    {
      id: 'birthday',
      title: 'Far-off dates',
      description: 'dropdowns adds month and year menus; format controls how the date is written.',
      Component: Birthday,
    },
  ],
  keyboard: [
    ['Enter / Space', 'Open the calendar on the chosen (or today’s) day'],
    ['Arrow keys, PageUp / PageDown', 'Move in the calendar'],
    ['Enter', 'Choose and close'],
    ['Esc', 'Close without changing'],
  ],
  a11y: [
    'The field is a button that says its label and value (“Start date: Oct 27, 2026”).',
    'The calendar opens as a dialog and focus returns to the field when it closes.',
    'The clear button is named “Clear <label>”.',
  ],
  props: [
    { name: 'value / defaultValue', type: 'Date | null', description: 'The date.' },
    { name: 'onChange', type: '(d: Date | null) => void', description: 'New date or null when cleared.' },
    { name: 'min / max', type: 'Date', description: 'Earliest and latest dates.' },
    { name: 'disabledDates', type: 'Matcher | Matcher[]', description: 'More dates to refuse.' },
    {
      name: 'format',
      type: 'Intl.DateTimeFormatOptions',
      defaultValue: "{ dateStyle: 'medium' }",
      description: 'How the value is written.',
    },
    { name: 'dropdowns', type: 'boolean', defaultValue: 'false', description: 'Month and year menus.' },
    { name: 'clearable', type: 'boolean', defaultValue: 'true', description: 'Show a clear button.' },
    { name: 'lang', type: 'string', description: 'Language (default: the page’s).' },
    { name: 'size / disabled / invalid / placeholder', type: '…', description: 'As on Input.' },
  ],
});
