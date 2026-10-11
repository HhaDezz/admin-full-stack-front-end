# API endpoints

All responses: `{ "success": true, "message": "…", "data": … }`. Errors use the same shape with `success: false`;
validation errors put `{ field: message }` in `data`. Send `Authorization: Bearer <token>` on every call except sign-in and `/health`.
`Atelier_API.postman_collection.json` in the API folder has ready-to-run requests (import it into Postman; *Sign in* stores the token for the rest).

| Method & path | Permission | Notes |
|---|---|---|
| `GET /auth/options` | – | `{ registrationEnabled, requireEmailVerification, brandName }` |
| `POST /auth/login` | – | `{ email, password }` → session with `token`, or `twoFactorRequired` + `challengeToken` |
| `POST /auth/login/2fa` | – | `{ challengeToken, code }`: six-digit code or a recovery code |
| `POST /auth/logout` | signed in | Signs this device out |
| `POST /auth/register` | – | `{ name, email, password }` (when sign-up is on) |
| `POST /auth/verify-email` | – | `{ token }` from the emailed link |
| `POST /auth/resend-verification` | – | `{ email }` |
| `POST /auth/forgot-password` | – | `{ email }`: sends a reset link if the account exists |
| `POST /auth/reset-password/check` | – | `{ token }`: is the link still valid? |
| `POST /auth/reset-password` | – | `{ token, password }`: signs out every device |
| `GET /me` | signed in | Current user, roles and effective permissions |
| `PUT /me` | signed in | `{ name, phone, address }` |
| `PUT /me/password` | signed in | `{ currentPassword, newPassword }` → new token; other devices signed out |
| `GET /me/security` | signed in | Email confirmed, two-step on, recovery codes left, devices |
| `POST /me/verify-password` | signed in | `{ password }`: unlocks the lock screen |
| `POST /me/2fa/setup` → `POST /me/2fa/enable` | signed in | Secret + `otpauth://` link, then `{ code }` → 10 recovery codes |
| `POST /me/2fa/disable`, `POST /me/2fa/recovery-codes` | signed in | `{ password }` |
| `GET /me/sessions`, `DELETE /me/sessions/{id}`, `DELETE /me/sessions` | signed in | Devices; sign out one, or all others |
| `GET/PUT /me/notification-settings` | signed in | `{ security, account, product }`, each `{ inApp, email }` |
| `GET /me/activity` | signed in | Own sign-ins and changes, last 90 days |
| `GET /me/notifications` | signed in | `unread`, `page`, `size` → `{ items, total, unreadCount }` |
| `GET /me/notifications/unread-count` | signed in | For the bell badge |
| `POST /me/notifications/{id}/read` · `/unread` · `POST /me/notifications/read-all` · `DELETE /me/notifications/{id}` | signed in | |
| `GET /dashboard/summary` | `dashboard-view` | |
| `GET /users`, `GET /users/{id}` | `admin-user-view` | |
| `POST /users` | `admin-user-create` | `{ name, email, password, phone?, address?, roleIds?, enabled? }` |
| `PUT /users/{id}` | `admin-user-edit` | Same body; `password` optional |
| `PATCH /users/{id}/status` | `admin-user-edit` | `{ enabled }` |
| `POST /users/{id}/2fa/reset` | `admin-user-edit` | Turns two-step off for someone who lost their phone |
| `DELETE /users/{id}` | `admin-user-delete` | |
| `GET /roles`, `GET /roles/{id}` | `admin-role-view` | Includes `userCount` |
| `POST /roles` | `admin-role-create` | `{ roleName, description?, permissions?: [names] }` |
| `PUT /roles/{id}` | `admin-role-edit` | Rename / describe; leave `permissions` out to keep them |
| `PUT /roles/{id}/permissions` | `admin-role-edit` | Body: `[permissionId, …]`, replaces the set |
| `DELETE /roles/{id}` | `admin-role-delete` | |
| `GET /permissions` | `admin-role-view` | The permission catalogue |
| `GET /audit-logs` | super admin | `date_from`, `date_to`, `category`, `search`, `limit` |
| `GET /health` | – | `{ "status": "UP" }` |


## Errors

| Status | When |
|---|---|
| 400 | Validation failed; `data` has `{ field: message }`. An expired or used email link adds `data.code: "LINK_INVALID"` |
| 401 | Not signed in, token expired or session signed out. A two-step sign-in that took too long adds `data.code: "CHALLENGE_EXPIRED"` |
| 403 | Missing the permission. Signing in before confirming the email adds `data.code: "EMAIL_NOT_VERIFIED"` |
| 404 | Not found |
| 409 | Conflict, e.g. an email that's already used |
| 429 | Too many attempts; the message says how long to wait |
