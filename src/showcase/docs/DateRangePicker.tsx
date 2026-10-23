import { useState } from 'react';
import { DateRangePicker, Field, type DateRange } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './DateRangePicker.tsx?raw';

// #region report
export function Report() {
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <div className="ex-col">
      <Field label="Report period" hint="Up to 90 days, nothing in the future.">
        <DateRangePicker value={range} onChange={setRange} max={new Date()} maxDays={90} />
      </Field>
    </div>
  );
}
// #endregion

// #region custom
export function Custom() {
  const day = (n: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
  };
  return (
    <div className="ex-col">
      <Field label="Stay">
        <DateRangePicker
          min={day(0)}
          presets={[
            { label: 'This weekend', range: () => ({ from: day(6 - new Date().getDay()), to: day(7 - new Date().getDay()) }) },
            { label: 'Next 7 nights', range: () => ({ from: day(0), to: day(7) }) },
          ]}
          placeholder="Check-in – check-out"
        />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'DateRangePicker',
  group: 'Date & time',
  status: 'new',
  description:
    'Pick a start and end date across two months, or in one click from presets such as “Last 30 days”. Limits and a longest-range rule.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'presets', default: true },
      { type: 'number', name: 'maxDays', default: 0, min: 0, max: 60, step: 7 },
      { type: 'boolean', name: 'clearable', default: true },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(320px, 100%)' }}>
        <DateRangePicker
          aria-label="Playground range"
          size={v.size as 'md'}
          presets={v.presets ? undefined : []}
          maxDays={Number(v.maxDays) || undefined}
          clearable={!!v.clearable}
          disabled={!!v.disabled}
        />
      </div>
    ),
    code: ({ presets, ...p }) =>
      jsx('DateRangePicker', p, { size: 'md', maxDays: 0, clearable: true, disabled: false }, undefined, [
        ...(presets ? [] : ['presets={[]}']),
        'value={range}',
        'onChange={setRange}',
      ]),
  },
  examples: [
    { id: 'report', title: 'Report period', description: 'Default presets, no future dates and at most 90 days.', Component: Report },
    {
      id: 'custom',
      title: 'Your own presets',
      description: 'Each preset returns { from, to } when clicked, so “today” is always current.',
      Component: Custom,
    },
  ],
  keyboard: [
    ['Enter / Space', 'Open'],
    ['Arrow keys', 'Move between days'],
    ['Enter', 'First press sets the start, the second sets the end'],
    ['Esc', 'Close'],
  ],
  a11y: [
    'The field says its label and the range (“Report period: Oct 1 – Oct 27, 2026”).',
    'A polite hint tells people what to pick next (“Now pick the end date”).',
    'Presets are buttons; the active one has aria-pressed.',
    'On narrow screens one month is shown instead of two.',
  ],
  props: [
    { name: 'value / defaultValue', type: '{ from?: Date; to?: Date } | null', description: 'The range.' },
    { name: 'onChange', type: '(r) => void', description: 'New range, or null when cleared.' },
    {
      name: 'presets',
      type: '{ label, range: () => { from, to } }[]',
      defaultValue: 'DEFAULT_RANGE_PRESETS',
      description: 'Quick choices; [] hides them.',
    },
    { name: 'maxDays', type: 'number', description: 'Longest allowed range.' },
    { name: 'min / max / disabledDates', type: 'Date / Matcher', description: 'As on DatePicker.' },
    { name: 'format / lang / clearable / size / disabled / invalid', type: '…', description: 'As on DatePicker.' },
  ],
});
