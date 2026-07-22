import { useMemo, useState } from 'react';
import { Activity, ArrowRight, Fingerprint, Globe, History, Monitor, ScrollText, Timer, UserRound } from 'lucide-react';
import { DataTable, type Column } from '../components/data-table';
import { SearchSelect } from '../components/search-select';
import { Badge, Modal } from '../components/ui';
import { useScrollFocus } from '../components/kit';
import { errorMessage } from '../lib/api';
import { dateTime, relativeTime, titleCase } from '../lib/format';
import { useAuditLog, type AuditFilters } from '../lib/queries';
import type { AuditEntry } from '../lib/types';

const CATEGORIES: { value: string; label: string; hint: string }[] = [
  { value: 'AUTH', label: 'Sign-ins', hint: 'Sign-in, failed sign-in and sign-out' },
  { value: 'BUSINESS', label: 'Events', hint: 'Named events such as password changes' },
  { value: 'REQUEST', label: 'Requests', hint: 'Every API call that changed something' },
  { value: 'DATA', label: 'Data changes', hint: 'Every database row created, updated or deleted, with old and new values' },
];
const CAT_TONE: Record<string, 'ok' | 'gold' | 'warn' | undefined> = { AUTH: 'ok', BUSINESS: 'gold', DATA: 'warn' };
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function actionTone(a: string): 'ok' | 'danger' | 'gold' | undefined {
  if (a === 'LOGIN_FAILED' || a === 'DELETE') return 'danger';
  if (a === 'CREATE' || a === 'LOGIN') return 'ok';
  if (a === 'PASSWORD_CHANGED') return 'gold';
  return undefined;
}

function parseChanges(json?: string | null): { field: string; old?: string; new?: string }[] {
  if (!json) return [];
  try {
    const obj = JSON.parse(json) as Record<string, { old?: string; new?: string }>;
    return Object.entries(obj).map(([field, v]) => ({ field, old: v?.old, new: v?.new }));
  } catch {
    return [];
  }
}

function EntryModal({
  entry,
  related,
  onClose,
  onOpen,
}: {
  entry: AuditEntry;
  related: AuditEntry[];
  onClose: () => void;
  onOpen: (e: AuditEntry) => void;
}) {
  const changes = parseChanges(entry.changes);
  const scrollRef = useScrollFocus();
  return (
    <Modal
      size="lg"
      icon={<ScrollText size={20} />}
      title={entry.details || titleCase(entry.action)}
      subtitle={`${dateTime(entry.createdAt)} · ${entry.userName}`}
      onClose={onClose}
      footer={
        <button className="btn" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="chips">
        <Badge tone={CAT_TONE[entry.category]}>{CATEGORIES.find((c) => c.value === entry.category)?.label ?? entry.category}</Badge>
        <Badge tone={actionTone(entry.action)}>{titleCase(entry.action)}</Badge>
        <Badge>
          {entry.module}
          {entry.recordId != null ? ` #${entry.recordId}` : ''}
        </Badge>
        {entry.statusCode != null && <Badge tone={entry.statusCode >= 400 ? 'danger' : 'ok'}>HTTP {entry.statusCode}</Badge>}
      </div>

      <div className="detail-grid">
        <div className="detail">
          <span className="detail-ico">
            <UserRound size={16} />
          </span>
          <div>
            <div className="detail-l">By</div>
            <div className="detail-v">{entry.userName}</div>
          </div>
        </div>
        <div className="detail">
          <span className="detail-ico">
            <Globe size={16} />
          </span>
          <div>
            <div className="detail-l">IP address</div>
            <div className="detail-v">{entry.ipAddress || '—'}</div>
          </div>
        </div>
        {entry.path && (
          <div className="detail">
            <span className="detail-ico">
              <Activity size={16} />
            </span>
            <div>
              <div className="detail-l">Request</div>
              <div className="detail-v mono">
                {entry.httpMethod} {entry.path}
              </div>
            </div>
          </div>
        )}
        {entry.durationMs != null && (
          <div className="detail">
            <span className="detail-ico">
              <Timer size={16} />
            </span>
            <div>
              <div className="detail-l">Duration</div>
              <div className="detail-v">{entry.durationMs} ms</div>
            </div>
          </div>
        )}
        {entry.userAgent && (
          <div className="detail" style={{ gridColumn: '1 / -1' }}>
            <span className="detail-ico">
              <Monitor size={16} />
            </span>
            <div>
              <div className="detail-l">Browser</div>
              <div className="detail-v" style={{ fontWeight: 450, fontSize: 13 }}>
                {entry.userAgent}
              </div>
            </div>
          </div>
        )}
      </div>

      {changes.length > 0 && (
        <div className="detail-block">
          <div className="label">What changed</div>
          <div className="table-wrap" ref={scrollRef} style={{ border: '1px solid var(--line-2)', borderRadius: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Before</th>
                  <th />
                  <th>After</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c.field}>
                    <td className="mono">{c.field}</td>
                    <td className="muted">{c.old ?? '—'}</td>
                    <td style={{ width: 24, padding: 0 }}>
                      <ArrowRight size={14} className="muted" />
                    </td>
                    <td>{c.new ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="detail-block">
          <div className="label">
            <Fingerprint size={13} style={{ verticalAlign: -2 }} /> Same request · {related.length} more
          </div>
          <div className="perm-summary">
            {related.map((r) => (
              <button key={r.id} className="related-row" onClick={() => onOpen(r)}>
                <Badge tone={CAT_TONE[r.category]}>{r.category}</Badge>
                <span>{r.details || titleCase(r.action)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AuditLog() {
  // Dates are filtered on the server; the type filter is applied here so the counts and
  // "same request" links always see every type.
  const [filters, setFilters] = useState<AuditFilters & { category: string }>(() => ({
    from: isoDay(new Date(Date.now() - 6 * 86_400_000)),
    to: '',
    category: '',
  }));
  const [people, setPeople] = useState<string[]>([]);
  const q = useAuditLog({ from: filters.from, to: filters.to });
  const rows = useMemo(
    () =>
      (q.data ?? []).filter(
        (e) => (!filters.category || e.category === filters.category) && (!people.length || people.includes(e.userName)),
      ),
    [q.data, filters.category, people],
  );
  const userOptions = useMemo(() => {
    const count = new Map<string, number>();
    (q.data ?? []).forEach((e) => count.set(e.userName, (count.get(e.userName) ?? 0) + 1));
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([u, n]) => ({ value: u, label: u, description: `${n} entr${n === 1 ? 'y' : 'ies'}` }));
  }, [q.data]);
  const [open, setOpen] = useState<AuditEntry | null>(null);

  const byRequest = useMemo(() => {
    const m = new Map<string, AuditEntry[]>();
    (q.data ?? []).forEach((e) => e.requestId && m.set(e.requestId, [...(m.get(e.requestId) ?? []), e]));
    return m;
  }, [q.data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (q.data ?? []).forEach((e) => (c[e.category] = (c[e.category] ?? 0) + 1));
    return c;
  }, [q.data]);

  const columns: Column<AuditEntry>[] = [
    {
      id: 'time',
      header: 'When',
      nowrap: true,
      hideable: false,
      sortValue: (e) => e.createdAt,
      exportValue: (e) => e.createdAt,
      cell: (e) => <span title={dateTime(e.createdAt)}>{relativeTime(e.createdAt)}</span>,
    },
    {
      id: 'category',
      header: 'Type',
      nowrap: true,
      sortValue: (e) => e.category,
      searchValue: (e) => e.category,
      cell: (e) => <Badge tone={CAT_TONE[e.category]}>{CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category}</Badge>,
    },
    {
      id: 'action',
      header: 'Action',
      nowrap: true,
      sortValue: (e) => e.action,
      searchValue: (e) => e.action,
      cell: (e) => <Badge tone={actionTone(e.action)}>{titleCase(e.action)}</Badge>,
    },
    { id: 'user', header: 'User', sortValue: (e) => e.userName, searchValue: (e) => e.userName, cell: (e) => e.userName },
    {
      id: 'module',
      header: 'Record',
      nowrap: true,
      sortValue: (e) => e.module,
      searchValue: (e) => e.module,
      exportValue: (e) => `${e.module}${e.recordId != null ? ' #' + e.recordId : ''}`,
      cell: (e) => (
        <span className="muted">
          {e.module}
          {e.recordId != null ? ` #${e.recordId}` : ''}
        </span>
      ),
    },
    {
      id: 'details',
      header: 'Details',
      searchValue: (e) => `${e.details ?? ''} ${e.path ?? ''}`,
      exportValue: (e) => e.details ?? '',
      cell: (e) => <span className="cell-clip">{e.details || '—'}</span>,
    },
    {
      id: 'ip',
      header: 'IP',
      defaultHidden: true,
      searchValue: (e) => e.ipAddress ?? '',
      cell: (e) => <span className="muted mono">{e.ipAddress || '—'}</span>,
    },
    {
      id: 'status',
      header: 'HTTP',
      defaultHidden: true,
      align: 'right',
      sortValue: (e) => e.statusCode ?? null,
      cell: (e) => e.statusCode ?? '—',
    },
    {
      id: 'duration',
      header: 'ms',
      defaultHidden: true,
      align: 'right',
      sortValue: (e) => e.durationMs ?? null,
      cell: (e) => e.durationMs ?? '—',
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Audit log</h1>
          <p>
            A tamper-proof record of who did what, and when. Only super admins can see it. Entries can’t be edited or deleted; old months
            are removed automatically.
          </p>
        </div>
      </div>

      <div className="stat-strip stat-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`card stat-btn ${filters.category === c.value ? 'is-on' : ''}`}
            title={c.hint}
            onClick={() => setFilters((f) => ({ ...f, category: f.category === c.value ? '' : c.value }))}
          >
            <b>{q.isLoading ? '–' : (counts[c.value] ?? 0)}</b>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <DataTable
        id="audit"
        data={rows}
        columns={columns}
        rowKey={(e) => e.id}
        loading={q.isLoading}
        error={q.isError ? `Couldn’t load the audit log. ${errorMessage(q.error)}` : null}
        searchPlaceholder="Search user, record or details"
        initialSort={{ id: 'time', dir: 'desc' }}
        pageSizes={[25, 50, 100]}
        filtered={!!filters.category || people.length > 0}
        toolbar={
          <>
            <SearchSelect
              aria-label="Type"
              placeholder="All types"
              minWidth={150}
              searchable={false}
              clearable
              value={filters.category || null}
              onChange={(v) => setFilters((f) => ({ ...f, category: v ?? '' }))}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label, description: c.hint }))}
            />
            <SearchSelect
              aria-label="Users"
              multiple
              placeholder="All users"
              searchPlaceholder="Search users…"
              minWidth={190}
              maxChips={1}
              value={people}
              onChange={setPeople}
              options={userOptions}
            />
            <label className="date-field">
              <span>From</span>
              <input
                type="date"
                className="input"
                value={filters.from}
                max={filters.to || undefined}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              />
            </label>
            <label className="date-field">
              <span>To</span>
              <input
                type="date"
                className="input"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              />
            </label>
          </>
        }
        onRowClick={setOpen}
        exportFileName="audit-log"
        empty={{
          icon: <History size={22} />,
          title: 'No entries in this period',
          description: 'Widen the date range or clear the type filter.',
        }}
      />

      {open && (
        <EntryModal
          entry={open}
          onClose={() => setOpen(null)}
          onOpen={setOpen}
          related={(open.requestId ? (byRequest.get(open.requestId) ?? []) : []).filter((e) => e.id !== open.id)}
        />
      )}
    </>
  );
}
