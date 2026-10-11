# Audit log

**Audit log** (super admins only) records three kinds of event:

| Category | What | Example |
|---|---|---|
| Sign-in | Sign-ins, failures, sign-outs, password and two-step changes | “Sign-in failed: wrong password” from 203.0.113.24 |
| Request | Every create, update and delete request, with status and duration | `PUT /users/12` 200 in 38 ms |
| Data | The rows a request changed, with before and after values | User 12: name “Ada” → “Ada Lovelace” |

Rows from the same request are linked, so you can open a request and see every row it touched. Filter by date, type and text, and export what you see as CSV.

## Your own events

```java
auditLogService.logAction("Invoice", invoice.getId(), AuditAction.UPDATE, null, "Approved invoice INV-12");
```

Data changes are captured by a Hibernate listener for every entity except the noisy ones (sessions, tokens, notifications). Turn row-level changes off with `AUDIT_DATA_CHANGES=false`.

## Retention

Entries older than `AUDIT_RETENTION_MONTHS` (default 3) are deleted by a nightly job. People can see their own sign-ins and changes under **My activity**.
