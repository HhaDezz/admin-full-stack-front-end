# Adding a permission

Permissions live in the database and are granted to roles. Name them `module-resource-action` (for example `billing-invoice-view`): the Roles page groups them into its permission grid by the first part automatically.

## 1. Add it with a migration

Create the next Flyway migration in the API, for example `src/main/resources/db/migration/V6__invoices.sql`:

```sql
INSERT INTO permissions (name, description) VALUES
  ('billing-invoice-view', 'See invoices'),
  ('billing-invoice-create', 'Create invoices');

-- Give them to the ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.name IN ('billing-invoice-view', 'billing-invoice-create');
```

Restart the API and the migration runs. Super admins hold every permission automatically.

## 2. Protect the endpoint

```java
@GetMapping
@PreAuthorize("hasAuthority('billing-invoice-view')")
public ApiResponse<List<InvoiceResponse>> list() { … }
```

## 3. Use it in the web app

- Guard the route with `<RequirePerm perm="billing-invoice-view">`.
- Add `perm: 'billing-invoice-view'` to the sidebar item.
- Hide actions with `can('billing-invoice-create')`.

See [Adding a page](./adding-a-page) for all three.

## Other things the API gives you

- **Audit a business event**: inject `AuditLogService` and call `logAction("Invoice", id, AuditAction.UPDATE, null, "Approved invoice INV-12")`. Requests and data changes are recorded automatically.
- **Who is calling?** `CurrentUser.get()` returns the signed-in user's id and email.
- **Notify someone**: `notificationService.notify(user, NotificationService.ACCOUNT, "INVOICE_APPROVED", "Invoice approved", "INV-12 was approved.", "/invoices/12")`. It follows the person's in-app and email preferences.
- **Fail with a friendly message**: `throw BusinessException.conflict("That name is taken.", "name")`. The web app shows it under the `name` field.
