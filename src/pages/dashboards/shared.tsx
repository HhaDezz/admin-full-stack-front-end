import { useMemo, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Badge, DateRangePicker, Tooltip, type DateRange, type RangePreset } from '../../components/kit';
import { DAILY } from '../../blocks/_data';

/* Shared by the sample dashboards: a date-range filter that scopes every chart on the page. */

const DAY = 86_400_000;
const today = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const daysAgo = (n: number) => new Date(today().getTime() - n * DAY);

export const DASH_PRESETS: RangePreset[] = [
  { label: 'Last 7 days', range: () => ({ from: daysAgo(6), to: today() }) },
  { label: 'Last 30 days', range: () => ({ from: daysAgo(29), to: today() }) },
  { label: 'Last 90 days', range: () => ({ from: daysAgo(89), to: today() }) },
  {
    label: 'This month',
    range: () => {
      const t = today();
      return { from: new Date(t.getFullYear(), t.getMonth(), 1), to: t };
    },
  },
];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
type Row = (typeof DAILY)[number];

/** The rows inside the range, and the same number of days just before it (for "vs previous period"). */
export function useDailyRange() {
  const [range, setRange] = useState<DateRange | null>(() => DASH_PRESETS[1].range());
  const { rows, prev, days } = useMemo(() => {
    const from = range?.from ?? daysAgo(29);
    const to = range?.to ?? from;
    const a = iso(from);
    const b = iso(to);
    const rows = DAILY.filter((r) => r.date >= a && r.date <= b);
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY) + 1);
    const pa = iso(new Date(from.getTime() - days * DAY));
    const pb = iso(new Date(from.getTime() - DAY));
    return { rows, prev: DAILY.filter((r) => r.date >= pa && r.date <= pb), days };
  }, [range]);
  return { range, setRange, rows, prev, days };
}

export const sum = (rows: Row[], key: keyof Row) => rows.reduce((a, r) => a + Number(r[key]), 0);
/** % change, or undefined when there's nothing to compare with. */
export const change = (now: number, before: number) => (before ? ((now - before) / before) * 100 : undefined);

/** Range picker, the "sample data" note and any extra filters, in one row above the content. */
export function DashFilters({
  range,
  onRange,
  children,
}: {
  range: DateRange | null;
  onRange: (r: DateRange | null) => void;
  children?: ReactNode;
}) {
  return (
    <div className="dash-filters" role="search" aria-label="Dashboard filters">
      <div className="dash-filter-range">
        <DateRangePicker
          aria-label="Date range"
          value={range}
          onChange={onRange}
          presets={DASH_PRESETS}
          max={new Date()}
          clearable={false}
        />
      </div>
      {children}
      <span className="grow" />
      <Tooltip content="These numbers are generated sample data. Point the queries in src/pages/dashboards at your API.">
        <span tabIndex={0} className="dash-sample">
          <Badge tone="gold">
            <Info size={12} aria-hidden="true" /> Sample data
          </Badge>
        </span>
      </Tooltip>
    </div>
  );
}
