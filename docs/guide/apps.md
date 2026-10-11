# App pages

Six complete app pages show the advanced components working together. They live in `src/pages/apps/` and appear under **Apps** in the sidebar when `VITE_SHOWCASE` is on.

| Page | Route | Built from |
| --- | --- | --- |
| Kanban | `/apps/kanban` | KanbanBoard, Drawer, Select |
| Calendar | `/apps/calendar` | Scheduler, Calendar, Modal, DatePicker, TimePicker |
| Chat | `/apps/chat` | ChatPanel, MentionInput |
| Mail | `/apps/mail` | RichTextEditor, Checkbox, EmptyState |
| Files | `/apps/files` | TreeView, FileUpload, Lightbox, DropdownMenu |
| Invoices | `/apps/invoices`, `/apps/invoices/:id` | DataTable, StatCard, a print stylesheet |

Every page shows a **Sample data** badge. The data is in `src/pages/apps/data.ts`, with dates relative to today so the demo never looks stale.

## Connecting your API

Each page keeps its data in React state that starts from `data.ts`. To use your back end:

1. Add a query for the list (see [Tables](/guide/tables) for the TanStack Query pattern), e.g. `useQuery({ queryKey: ['tasks'], queryFn: () => api.get('/tasks') })`.
2. Replace the `useState(TASKS)` line with the query's data.
3. Turn the handlers into mutations: the Kanban's `onChange(items, move)` gives you `{ id, from, to, index }`, which is exactly what a "move task" endpoint needs; the Scheduler's `onEventMove(event, start, end)` maps to an update.

Invoices share a tiny store (`invoiceStore.ts`) so the list and the detail page agree; swap it for query invalidation once you have an API.

## Printing invoices

The invoice page prints only the invoice: `apps.css` hides the sidebar, top bar and page header under `@media print`. **PDF** opens the same print dialog, where people pick “Save as PDF”. If you need server-made PDFs, render the same markup with a headless browser.

## Security notes

- Mail bodies are shown with `dangerouslySetInnerHTML`. The sample HTML is ours; real mail must be sanitised on the server first.
- RichTextEditor saves HTML. Sanitise it on the server before showing it to anyone else (for Spring Boot, the OWASP Java HTML Sanitizer works well).

## Removing them

Delete `src/pages/apps/`, the seven `apps/...` routes in `src/App.tsx`, and the **Apps** section in `src/components/Layout.tsx`. The components stay in the kit.
