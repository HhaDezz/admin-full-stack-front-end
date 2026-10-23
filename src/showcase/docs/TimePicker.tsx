import { useState } from 'react';
import { Field, TimePicker } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './TimePicker.tsx?raw';

// #region meeting
export function Meeting() {
  const [time, setTime] = useState<string | null>('09:30');
  return (
    <div className="ex-col">
      <Field label="Starts at" hint={time ? `Stored as "${time}"` : 'Not set'}>
        <TimePicker value={time} onChange={setTime} listFrom="08:00" listTo="18:00" listStep={15} />
      </Field>
    </div>
  );
}
// #endregion

// #region clocks
export function Clocks() {
  return (
    <div className="ex-col">
      <Field label="24-hour clock">
        <TimePicker defaultValue="17:45" hour12={false} />
      </Field>
      <Field label="12-hour clock, no list">
        <TimePicker defaultValue="17:45" hour12 listStep={0} step={1} />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'TimePicker',
  group: 'Date & time',
  status: 'new',
  description:
    'Type hours and minutes or pick from a list. The value is always "HH:mm" (24-hour); what people see follows their language’s 12- or 24-hour clock.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'clock', options: ['auto', '12', '24'], default: 'auto' },
      { type: 'number', name: 'step', default: 5, min: 1, max: 30 },
      { type: 'number', name: 'listStep', default: 30, min: 0, max: 60, step: 15 },
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <TimePicker
        key={String(v.clock)}
        aria-label="Playground time"
        defaultValue="14:30"
        hour12={v.clock === 'auto' ? undefined : v.clock === '12'}
        step={Number(v.step)}
        listStep={Number(v.listStep)}
        size={v.size as 'md'}
        disabled={!!v.disabled}
      />
    ),
    code: ({ clock, ...p }) =>
      jsx('TimePicker', p, { step: 5, listStep: 30, size: 'md', disabled: false }, undefined, [
        ...(clock === 'auto' ? [] : [clock === '12' ? 'hour12' : 'hour12={false}']),
        'value={time}',
        'onChange={setTime}',
      ]),
  },
  examples: [
    {
      id: 'meeting',
      title: 'Office hours',
      description: 'A list every 15 minutes between 08:00 and 18:00, and free typing for anything else.',
      Component: Meeting,
    },
    {
      id: 'clocks',
      title: '12- and 24-hour clocks',
      description: 'Force one with hour12; listStep={0} hides the list.',
      Component: Clocks,
    },
  ],
  keyboard: [
    ['0 – 9', 'Type the hours, then the minutes'],
    ['Up / Down', 'One hour, or step minutes'],
    ['Left / Right', 'Between hours, minutes and AM/PM'],
    ['A / P', 'AM or PM'],
    ['Backspace', 'Clear the part'],
  ],
  a11y: [
    'Hours, minutes and AM/PM are spinbuttons with a spoken value (“2:30 PM”).',
    'The group is named with the label and current time.',
    'The list is a listbox; the chosen time is selected and scrolled into view.',
  ],
  props: [
    { name: 'value / defaultValue', type: 'string | null', description: '"HH:mm", 24-hour.' },
    { name: 'onChange', type: '(v: string | null) => void', description: 'New time, or null when a part is empty.' },
    { name: 'step', type: 'number', defaultValue: '5', description: 'Minutes per arrow key.' },
    { name: 'listStep', type: 'number', defaultValue: '30', description: 'Minutes between list times; 0 hides the list.' },
    { name: 'listFrom / listTo', type: 'string', defaultValue: "'00:00' / '23:59'", description: 'List range.' },
    { name: 'hour12', type: 'boolean', description: 'Force a clock (default: from the language).' },
    { name: 'lang / size / disabled / invalid', type: '…', description: 'As on DatePicker.' },
  ],
});
