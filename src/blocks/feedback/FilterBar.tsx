/**
 * Filter bar: search, status, owner and date range in one row, with removable chips and a count.
 * Uses: Input, SearchSelect, DateRangePicker, Tag, Button. Pass the filters to your table or query.
 */
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button, DateRangePicker, Input, SearchSelect, Tag, type DateRange } from '@/components/kit';

const STATUSES = ['Open', 'In progress', 'Blocked', 'Done'].map((s) => ({ value: s, label: s }));
const OWNERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing'].map((s) => ({ value: s, label: s }));
const fmt = (d?: Date) => d?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function FilterBar() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string[]>(['Open', 'In progress']);
  const [owner, setOwner] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange | null>(null);
  const chips = useMemo(
    () => [
      ...status.map((s) => ({ id: `s-${s}`, label: `Status: ${s}`, clear: () => setStatus(status.filter((x) => x !== s)) })),
      ...(owner ? [{ id: 'o', label: `Owner: ${owner}`, clear: () => setOwner(null) }] : []),
      ...(range?.from ? [{ id: 'd', label: `${fmt(range.from)} – ${fmt(range.to) ?? '…'}`, clear: () => setRange(null) }] : []),
    ],
    [status, owner, range],
  );
  const results = 128 - status.length * 17 - (owner ? 40 : 0) - (range ? 23 : 0) - q.length * 3;
  return (
    <div className="card blk-filters" role="search" aria-label="Filter tasks">
      <div className="blk-filter-row">
        <div className="blk-filter-search">
          <Input
            aria-label="Search tasks"
            placeholder="Search tasks"
            prefix={<Search size={16} />}
            clearable
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <SearchSelect
          aria-label="Status"
          multiple
          placeholder="Status"
          options={STATUSES}
          value={status}
          onChange={setStatus}
          searchable={false}
          minWidth={170}
          maxChips={1}
        />
        <SearchSelect aria-label="Owner" placeholder="Owner" options={OWNERS} value={owner} onChange={setOwner} clearable minWidth={170} />
        <div className="blk-filter-date">
          <DateRangePicker aria-label="Due date" value={range} onChange={setRange} placeholder="Due date" />
        </div>
      </div>
      <div className="blk-filter-chips">
        <span className="muted" role="status" aria-live="polite">
          {Math.max(0, results)} tasks
        </span>
        {chips.map((c) => (
          <Tag key={c.id} onRemove={c.clear}>
            {c.label}
          </Tag>
        ))}
        {chips.length > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setStatus([]);
              setOwner(null);
              setRange(null);
              setQ('');
            }}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
