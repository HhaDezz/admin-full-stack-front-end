import { useCallback, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Avatar, Badge, Button, DataTable, SearchSelect, type Column, type TableQuery } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './DataTable.tsx?raw';

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited' | 'Disabled';
  joined: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Katherine', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Frances', 'Edsger', 'Radia'];
const LAST = [
  'Lovelace',
  'Hopper',
  'Turing',
  'Johnson',
  'Torvalds',
  'Hamilton',
  'Ritchie',
  'Liskov',
  'Thompson',
  'Allen',
  'Dijkstra',
  'Perlman',
];
const ROLES = ['Admin', 'Support', 'Finance', 'Viewer'];
const STATUS: Person['status'][] = ['Active', 'Active', 'Active', 'Invited', 'Disabled'];
const PEOPLE: Person[] = Array.from({ length: 48 }, (_, i) => {
  const name = `${FIRST[i % 12]} ${LAST[(i * 5 + Math.floor(i / 12)) % 12]}`;
  return {
    id: i + 1,
    name,
    email: `${name.split(' ')[0].toLowerCase()}${i}@example.com`,
    role: ROLES[i % 4],
    status: STATUS[i % 5],
    joined: new Date(2026, i % 10, (i % 27) + 1).toISOString().slice(0, 10),
  };
});
const TONE = { Active: 'ok', Invited: 'info', Disabled: 'danger' } as const;

// #region full
export function Full() {
  const [rows, setRows] = useState(PEOPLE);
  const [role, setRole] = useState<string | null>(null);
  const columns: Column<Person>[] = [
    {
      id: 'name',
      header: 'Name',
      sortValue: (p) => p.name,
      searchValue: (p) => `${p.name} ${p.email}`,
      exportValue: (p) => p.name,
      hideable: false,
      cell: (p) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={p.name} size="sm" />
          <span>
            <b style={{ fontWeight: 600 }}>{p.name}</b>
            <br />
            <span className="muted" style={{ fontSize: 12.5 }}>
              {p.email}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      sortValue: (p) => p.role,
      searchValue: (p) => p.role,
      cell: (p) => <Badge seed={p.role}>{p.role}</Badge>,
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (p) => p.status,
      cell: (p) => (
        <Badge tone={TONE[p.status]} dot>
          {p.status}
        </Badge>
      ),
    },
    { id: 'joined', header: 'Joined', sortValue: (p) => p.joined, cell: (p) => p.joined, nowrap: true, defaultHidden: true },
  ];
  return (
    <div className="ex-wide">
      <DataTable
        id="kit-demo-people"
        data={role ? rows.filter((r) => r.role === role) : rows}
        filtered={!!role}
        columns={columns}
        rowKey={(p) => p.id}
        initialSort={{ id: 'name', dir: 'asc' }}
        selectable
        exportFileName="people"
        toolbar={
          <SearchSelect
            aria-label="Role"
            placeholder="All roles"
            clearable
            searchable={false}
            minWidth={150}
            value={role}
            onChange={setRole}
            options={ROLES.map((r) => ({ value: r, label: r }))}
          />
        }
        bulkActions={(sel, clear) => (
          <Button
            size="sm"
            variant="danger"
            iconStart={<Trash2 size={14} />}
            onClick={() => {
              const ids = new Set(sel.map((s) => s.id));
              setRows((r) => r.filter((x) => !ids.has(x.id)));
              clear();
            }}
          >
            Delete {sel.length}
          </Button>
        )}
        empty={{ title: 'No people yet', description: 'Invite someone to get started.' }}
        emptyFiltered={{ title: 'Nobody matches', description: 'Try another search or clear the role filter.' }}
      />
    </div>
  );
}
// #endregion

// #region states
export function States() {
  const [state, setState] = useState<'loading' | 'error' | 'empty'>('loading');
  const columns: Column<Person>[] = [
    { id: 'name', header: 'Name', cell: (p) => p.name },
    { id: 'email', header: 'Email', cell: (p) => p.email },
  ];
  return (
    <div className="ex-col" style={{ width: '100%' }}>
      <div className="ex-row">
        {(['loading', 'error', 'empty'] as const).map((s) => (
          <Button key={s} size="sm" variant={state === s ? 'primary' : 'secondary'} onClick={() => setState(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>
      <DataTable
        id="kit-demo-states"
        data={state === 'empty' ? [] : undefined}
        loading={state === 'loading'}
        error={state === 'error' ? 'The server didn’t respond. Try again in a moment.' : null}
        columns={columns}
        rowKey={(p) => p.id}
        searchable={false}
        empty={{ icon: <Download size={22} />, title: 'Nothing imported yet', description: 'Upload a CSV to fill this table.' }}
      />
    </div>
  );
}
// #endregion

// #region pinned
interface Order {
  id: number;
  number: string;
  customer: string;
  city: string;
  items: number;
  total: number;
  status: 'Paid' | 'Refunded' | 'Pending';
  placed: string;
  channel: string;
  notes: string;
}

const CITIES = ['Colombo', 'London', 'Lisbon', 'Austin', 'Osaka', 'Nairobi'];
const ORDERS: Order[] = PEOPLE.slice(0, 24).map((p, i) => ({
  id: p.id,
  number: `#${1040 + i}`,
  customer: p.name,
  city: CITIES[i % 6],
  items: (i % 4) + 1,
  total: 40 + ((i * 37) % 260),
  status: (['Paid', 'Paid', 'Pending', 'Refunded'] as const)[i % 4],
  placed: p.joined,
  channel: ['Web', 'Store', 'App'][i % 3],
  notes: i % 3 ? 'Gift wrap' : 'Leave at the front desk if nobody answers',
}));
const money = (n: number) => `$${n.toFixed(2)}`;

export function Pinned() {
  return (
    <div className="ex-wide">
      <DataTable
        id="kit-demo-orders-pinned"
        label="Orders"
        data={ORDERS}
        rowKey={(o) => o.id}
        resizableColumns
        pinActions
        columns={[
          {
            id: 'number',
            header: 'Order',
            pin: 'start',
            width: 96,
            sortValue: (o) => o.id,
            searchValue: (o) => o.number,
            cell: (o) => <b>{o.number}</b>,
          },
          {
            id: 'customer',
            header: 'Customer',
            pin: 'start',
            width: 170,
            sortValue: (o) => o.customer,
            searchValue: (o) => o.customer,
            cell: (o) => o.customer,
          },
          { id: 'city', header: 'City', width: 130, sortValue: (o) => o.city, cell: (o) => o.city },
          { id: 'items', header: 'Items', width: 90, align: 'right', sortValue: (o) => o.items, cell: (o) => o.items },
          { id: 'total', header: 'Total', width: 110, align: 'right', sortValue: (o) => o.total, cell: (o) => money(o.total) },
          {
            id: 'status',
            header: 'Status',
            width: 120,
            sortValue: (o) => o.status,
            cell: (o) => <Badge tone={o.status === 'Paid' ? 'ok' : o.status === 'Pending' ? 'warn' : 'danger'}>{o.status}</Badge>,
          },
          { id: 'placed', header: 'Placed', width: 130, sortValue: (o) => o.placed, cell: (o) => o.placed, nowrap: true },
          { id: 'channel', header: 'Channel', width: 110, cell: (o) => o.channel },
          { id: 'notes', header: 'Notes', width: 260, cell: (o) => o.notes, nowrap: true },
        ]}
        rowActions={(o) => (
          <Button size="sm" variant="ghost">
            Open {o.number}
          </Button>
        )}
      />
    </div>
  );
}
// #endregion

// #region expand
export function Expand() {
  return (
    <div className="ex-wide">
      <DataTable
        id="kit-demo-orders-expand"
        label="Orders with details"
        data={ORDERS.slice(0, 8)}
        rowKey={(o) => o.id}
        searchable={false}
        columns={[
          { id: 'number', header: 'Order', cell: (o) => <b>{o.number}</b> },
          { id: 'customer', header: 'Customer', cell: (o) => o.customer },
          { id: 'total', header: 'Total', align: 'right', cell: (o) => money(o.total) },
        ]}
        expandable={{
          canExpand: (o) => o.status !== 'Pending',
          render: (o) => (
            <dl className="dt-demo-detail">
              <dt>Ship to</dt>
              <dd>{o.city}</dd>
              <dt>Items</dt>
              <dd>{o.items}</dd>
              <dt>Notes</dt>
              <dd>{o.notes}</dd>
            </dl>
          ),
        }}
      />
    </div>
  );
}
// #endregion

// #region server
// Stands in for your API: GET /people?page=&size=&sort=&q= returning { rows, total }.
function fetchPeople(q: TableQuery): Promise<{ rows: Person[]; total: number }> {
  const needle = q.search.toLowerCase();
  let rows = PEOPLE.filter((p) => !needle || `${p.name} ${p.email}`.toLowerCase().includes(needle));
  if (q.sort) {
    const key = q.sort.id as keyof Person;
    const dir = q.sort.dir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => String(a[key]).localeCompare(String(b[key])) * dir);
  }
  const start = (q.page - 1) * q.pageSize;
  return new Promise((resolve) => setTimeout(() => resolve({ rows: rows.slice(start, start + q.pageSize), total: rows.length }), 400));
}

export function Server() {
  const [result, setResult] = useState<{ rows: Person[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  // With TanStack Query: useQuery({ queryKey: ['people', q], queryFn: () => fetchPeople(q), placeholderData: keepPreviousData })
  const onQueryChange = useCallback((q: TableQuery) => {
    setLoading(true);
    fetchPeople(q).then((r) => {
      setResult(r);
      setLoading(false);
    });
  }, []);
  return (
    <div className="ex-wide">
      <DataTable
        id="kit-demo-server"
        label="People (server)"
        data={result?.rows}
        loading={loading && !result}
        rowKey={(p) => p.id}
        server={{ total: result?.total ?? 0, onQueryChange }}
        searchPlaceholder="Search the server"
        columns={[
          { id: 'name', header: 'Name', sortValue: (p) => p.name, cell: (p) => p.name },
          { id: 'email', header: 'Email', sortValue: (p) => p.email, cell: (p) => p.email },
          { id: 'role', header: 'Role', cell: (p) => <Badge seed={p.role}>{p.role}</Badge> },
        ]}
      />
    </div>
  );
}
// #endregion

// #region virtual
const LOGS = Array.from({ length: 10_000 }, (_, i) => ({
  id: i + 1,
  at: new Date(Date.UTC(2026, 9, 27, 12) - i * 37_000).toISOString().replace('T', ' ').slice(0, 19),
  level: i % 17 === 0 ? 'error' : i % 5 === 0 ? 'warn' : 'info',
  message: `${['GET', 'POST', 'PUT', 'DELETE'][i % 4]} /api/${['users', 'roles', 'orders', 'audit'][i % 4]}/${(i * 7) % 900} ${i % 17 === 0 ? '500' : '200'}`,
}));

export function Virtual() {
  return (
    <div className="ex-wide">
      <DataTable
        id="kit-demo-virtual"
        label="Request log"
        data={LOGS}
        rowKey={(l) => l.id}
        virtual={{ height: 420 }}
        columns={[
          {
            id: 'at',
            header: 'Time (UTC)',
            width: 190,
            sortValue: (l) => l.at,
            cell: (l) => <span className="mono">{l.at}</span>,
            nowrap: true,
          },
          {
            id: 'level',
            header: 'Level',
            width: 100,
            sortValue: (l) => l.level,
            searchValue: (l) => l.level,
            cell: (l) => <Badge tone={l.level === 'error' ? 'danger' : l.level === 'warn' ? 'warn' : 'neutral'}>{l.level}</Badge>,
          },
          { id: 'message', header: 'Message', searchValue: (l) => l.message, cell: (l) => <span className="mono">{l.message}</span> },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'DataTable',
  group: 'Data display',
  status: 'updated',
  imports: ['DataTable', 'type Column', 'type TableQuery'],
  description:
    'Sorting, search, filters, a column picker, row selection with bulk actions, density, page sizes and CSV export. Pinned and resizable columns, expandable rows, server mode and virtual rows for 10,000+ rows. It remembers each user’s choices.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'selectable', default: true },
      { type: 'boolean', name: 'searchable', default: true },
      { type: 'boolean', name: 'export', label: 'exportFileName', default: true },
      { type: 'boolean', name: 'loading', default: false },
      { type: 'boolean', name: 'empty', label: 'no data', default: false },
      { type: 'boolean', name: 'error', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <DataTable
          id="kit-playground-people"
          label="Playground people"
          data={v.empty ? [] : PEOPLE.slice(0, 18)}
          loading={!!v.loading}
          error={v.error ? 'Couldn’t load people. Try again.' : undefined}
          columns={[
            { id: 'name', header: 'Name', sortValue: (p) => p.name, searchValue: (p) => p.name, cell: (p) => p.name, hideable: false },
            { id: 'role', header: 'Role', sortValue: (p) => p.role, cell: (p) => <Badge seed={p.role}>{p.role}</Badge> },
            { id: 'status', header: 'Status', sortValue: (p) => p.status, cell: (p) => p.status },
          ]}
          rowKey={(p) => p.id}
          selectable={!!v.selectable}
          searchable={!!v.searchable}
          exportFileName={v.export ? 'people' : undefined}
          empty={{ title: 'No people yet', description: 'Invite someone to get started.' }}
        />
      </div>
    ),
    code: ({ export: ex, empty: _e, error, ...p }) =>
      jsx('DataTable', p, { selectable: false, searchable: true, loading: false }, undefined, [
        'data={people}',
        'columns={columns}',
        'rowKey={(p) => p.id}',
        ...(ex ? ['exportFileName="people"'] : []),
        ...(error ? ['error={errorMessage}'] : []),
      ]),
  },
  examples: [
    {
      id: 'full',
      title: 'Everything on',
      description:
        'Search names, filter by role, sort any column, pick columns (“Joined” starts hidden), select rows to delete them, export CSV.',
      Component: Full,
    },
    {
      id: 'states',
      title: 'Loading, error and empty',
      description: 'Skeleton rows, an error message and an empty state, each built in.',
      Component: States,
    },
    {
      id: 'pinned',
      title: 'Pinned and resizable columns',
      description:
        'Order and Customer stay put while the rest scroll sideways; the actions column is pinned to the end. Drag a header edge (or focus it and use the arrow keys) to resize; double-click resets. On phones pinning switches off so everything scrolls.',
      Component: Pinned,
    },
    {
      id: 'expand',
      title: 'Expandable rows',
      description: 'expandable.render draws a detail panel under the row; canExpand hides the chevron where there’s nothing to show.',
      Component: Expand,
    },
    {
      id: 'server',
      title: 'Server mode',
      description:
        'The table reports page, page size, sort and search (debounced) through onQueryChange; you fetch and pass the page and total back.',
      Component: Server,
    },
    {
      id: 'virtual',
      title: '10,000 rows, virtualised',
      description:
        'virtual renders only the rows in view, so search and sort stay instant on long lists. The header sticks while you scroll.',
      Component: Virtual,
    },
  ],
  keyboard: [
    ['Tab', 'Move through the controls, headers and rows'],
    ['Left / Right', 'On a column edge: narrower or wider (Shift for bigger steps)'],
    ['Home', 'On a column edge: back to the default width'],
    ['Enter', 'Sort by the focused header; open the focused row when rows are clickable'],
    ['Space', 'Toggle the focused checkbox'],
  ],
  a11y: [
    'Sortable headers are buttons, and the sorted column has aria-sort.',
    'The number of results is announced politely while a search or filter is active.',
    'Selection checkboxes are named “Select row” and “Select all rows”; the bulk bar is a labelled region.',
    'Column edges are separators named “Resize <column>” that work from the keyboard.',
    'Expand buttons have aria-expanded and point at their detail row with aria-controls.',
    'Virtual tables keep aria-rowcount and aria-rowindex, so screen readers know where they are in the full list.',
  ],
  props: [
    { name: 'id', type: 'string', description: 'Key for remembered page size, density and columns.' },
    { name: 'data', type: 'T[] | undefined', description: 'Rows; undefined while loading.' },
    {
      name: 'columns',
      type: 'Column<T>[]',
      description:
        '{ id, header, cell, sortValue?, searchValue?, exportValue?, align?, width?, minWidth?, hideable?, defaultHidden?, nowrap?, pin?, resizable? }',
    },
    { name: 'rowKey', type: '(row: T) => string | number', description: 'Stable key.' },
    { name: 'loading / error', type: 'boolean / string | null', description: 'Skeleton or error message.' },
    { name: 'searchable / searchPlaceholder', type: 'boolean / string', defaultValue: 'true', description: 'Built-in search box.' },
    { name: 'toolbar', type: 'ReactNode', description: 'Filters beside the search.' },
    { name: 'initialSort', type: '{ id, dir }', description: 'Starting sort.' },
    { name: 'pageSizes', type: 'number[]', defaultValue: '[10, 25, 50, 100]', description: 'Rows-per-page options.' },
    {
      name: 'selectable / bulkActions',
      type: 'boolean / (rows, clear) => ReactNode',
      description: 'Checkbox column and actions for the selection.',
    },
    { name: 'rowActions / onRowClick', type: '(row) => ReactNode / (row) => void', description: 'Per-row buttons; clickable rows.' },
    { name: 'exportFileName', type: 'string', description: 'Turns on Export CSV.' },
    {
      name: 'empty / emptyFiltered / filtered',
      type: 'EmptyState / EmptyState / boolean',
      description: 'Empty states for no data and no matches.',
    },
    { name: 'label', type: 'string', description: 'Name for screen readers; also names the pagination and bulk bar.' },
    { name: 'resizableColumns', type: 'boolean', description: 'Drag or arrow-key resizing; widths are remembered.' },
    { name: 'pinActions', type: 'boolean', description: 'Keep the row-actions column at the end while scrolling sideways.' },
    { name: 'expandable', type: '{ render: (row) => ReactNode; canExpand?: (row) => boolean }', description: 'Detail panel under rows.' },
    {
      name: 'server',
      type: '{ total: number; onQueryChange: (q: TableQuery) => void }',
      description: 'Server-side search, sort and paging. TableQuery is { page, pageSize, sort, search }.',
    },
    { name: 'virtual', type: 'boolean | { height?: number }', description: 'Render only visible rows; no pagination.' },
  ],
});
