# Tables

`DataTable` handles search, sorting, pagination, a column picker, row selection with bulk actions, density and CSV export. It remembers each person's page size, density, hidden columns and column widths in their browser.

```tsx
import { DataTable, type Column } from '@/components/kit';

const columns: Column<User>[] = [
  { id: 'name', header: 'Name', cell: (u) => u.name, sortValue: (u) => u.name, searchValue: (u) => `${u.name} ${u.email}`, pin: 'start' },
  { id: 'role', header: 'Role', cell: (u) => u.role, sortValue: (u) => u.role },
  { id: 'joined', header: 'Joined', cell: (u) => shortDate(u.createdAt), sortValue: (u) => u.createdAt, defaultHidden: true },
];

<DataTable id="users" label="Users" data={users.data} loading={users.isLoading} rowKey={(u) => u.id} columns={columns} selectable exportFileName="users" />;
```

## Wide tables

- `pin: 'start'` or `pin: 'end'` on a column keeps it in view while the rest scroll sideways; `pinActions` does the same for the row-actions column. On phones pinning switches off so everything scrolls.
- `resizableColumns` lets people drag a header's edge, or focus it and use the arrow keys. Double-click resets it.

## Details under a row

```tsx
<DataTable … expandable={{ render: (o) => <OrderDetails order={o} />, canExpand: (o) => o.items > 0 }} />
```

## Server-side data

For tables too big to load at once, pass `server`. The table stops searching, sorting and paging by itself and tells you what to fetch:

```tsx
const [q, setQ] = useState<TableQuery | null>(null);
const page = useQuery({
  queryKey: ['people', q],
  queryFn: () =>
    unwrap<{ rows: Person[]; total: number }>(
      api.get('/people', {
        params: { page: q!.page, size: q!.pageSize, sort: q!.sort ? `${q!.sort.id},${q!.sort.dir}` : undefined, q: q!.search },
      }),
    ),
  enabled: !!q,
  placeholderData: keepPreviousData,
});

<DataTable … data={page.data?.rows} server={{ total: page.data?.total ?? 0, onQueryChange: setQ }} />;
```

`TableQuery` is `{ page, pageSize, sort, search }`; search waits until typing pauses.

## Long lists

`virtual` renders only the rows in view, with a sticky header and no pagination, so 10,000 rows stay smooth:

```tsx
<DataTable … virtual={{ height: 480 }} />
```
