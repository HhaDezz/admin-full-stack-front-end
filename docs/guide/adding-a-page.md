# Adding a page

`src/pages/BlankPage.tsx` is a starter page with a header, a permission check and an empty state. Copy it to begin a feature.

## 1. Create the page

```bash
cp src/pages/BlankPage.tsx src/pages/Invoices.tsx
```

Rename the component, set the permission it needs, and replace the empty state with your content. Build it from the kit and the blocks:

```tsx
import { Button, Card, DataTable, PageHeader } from '@/components/kit';
import { Plus } from 'lucide-react';

export default function Invoices() {
  const invoices = useInvoices(); // your query, see below
  return (
    <>
      <PageHeader title="Invoices" actions={<Button variant="primary" iconStart={<Plus size={16} />}>New invoice</Button>} />
      <DataTable id="invoices" label="Invoices" data={invoices.data} loading={invoices.isLoading} rowKey={(i) => i.id} columns={columns} />
    </>
  );
}
```

## 2. Add a route

In `src/App.tsx`, lazy-load the page and add a route inside the signed-in layout. `RequirePerm` shows a 403 page to anyone without the permission:

```tsx
const Invoices = lazy(() => import('./pages/Invoices'));

<Route
  path="invoices"
  element={
    <RequirePerm perm="billing-invoice-view">
      <Invoices />
    </RequirePerm>
  }
/>
```

## 3. Add it to the menu

In `src/components/Layout.tsx`, add an item to `SECTIONS` with the same permission, so people who can't open the page don't see it, and a title in `TITLES` for the breadcrumb in the top bar:

```tsx
{ to: '/invoices', label: 'Invoices', icon: <ReceiptText size={19} />, perm: 'billing-invoice-view' },
```

```tsx
const TITLES = { /* … */ '/invoices': 'Invoices' };
```

The command palette (⌘K) builds its list from the sidebar, so the page is searchable straight away.

## 4. Fetch data

Add a query in `src/lib/queries.ts`. `unwrap` returns the response's `data` and throws a readable error otherwise:

```ts
export function useInvoices() {
  const { can } = useAuth();
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => unwrap<Invoice[]>(api.get('/invoices')),
    enabled: can('billing-invoice-view'),
  });
}
```

For changes, use `useMutation` and invalidate the list afterwards; see `src/pages/Users.tsx` for create, edit and delete with toasts and confirmation.

## 5. Hide buttons people can't use

```tsx
const { can } = useAuth();
{can('billing-invoice-create') && <Button>New invoice</Button>}
```

Permissions refresh when the tab regains focus, so changing a role takes effect without signing out.
