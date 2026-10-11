# Project structure

## Web app (`atelier-admin`)

```
src/
  components/
    kit/           The UI kit: one file per component; index.ts exports them all
    charts/        Charts kit (imported separately so pages without charts stay light)
    data-table/    DataTable
    search-select/ SearchSelect
    Layout.tsx     App shell: sidebar sections, top bar, breadcrumbs, command palette
  blocks/          30 ready-made sections (stats, charts, lists, forms, pricing, auth, feedback)
  pages/           Dashboard, Users, Roles, Permissions, AuditLog, BlankPage (starter)
    auth/          Sign in, sign up, confirm email, forgot / reset password, lock screen
    account/       Settings tabs, notifications, my activity
    dashboards/    Analytics, Sales and Projects (sample data)
    content/       Pricing, Help centre, Changelog
    system/        404, 403, 500, maintenance, coming soon
  showcase/        UI Kit gallery: registry, docs pages, playground, blocks gallery
  lib/             API client, auth/session, queries, types, theme, motion, demo-mode mock server
  styles/          tokens/ (design tokens), global.css, kit*.css, blocks.css
docs/              This documentation site (VitePress)
```

**Imports.** Components come from one place:

```tsx
import { Button, Card, DataTable, Modal, useToast } from '@/components/kit';
import { AreaChart, BarChart } from '@/components/charts';
```

**Data.** API calls go through `src/lib/api.ts` (Axios with the token and error handling). Queries live in `src/lib/queries.ts` (TanStack Query), types in `src/lib/types.ts`.

**Demo mode.** `src/lib/mock.ts` and `src/lib/mock-account.ts` imitate the API. They're only bundled when `VITE_DEMO_MODE=true`.

## API (`atelier-api`)

```
src/main/java/com/atelier/api/
  config/        Settings (AppProperties), Flyway, async, audit interceptor and data-change listener
  controller/    Auth, Me, Notification, User, Role, Permission, Dashboard, AuditLog, Health
  dto/           Requests and responses
  entity/        User, Role, Permission, AuditLog, UserSession, UserToken, RecoveryCode, Notification…
  repository/    One per entity
  security/      JWT, sessions, two-step (TOTP), rate limits, password checks
  service/       Users, roles, accounts, notifications, mail, dashboard, audit
src/main/resources/
  application.properties.example
  db/migration/  Flyway migrations V1–V5 (run on start)
```

Every response has the same shape: `{ "success": true, "message": "…", "data": … }`. Validation errors put `{ field: message }` in `data`, and the web app's forms show them under the right inputs automatically.
