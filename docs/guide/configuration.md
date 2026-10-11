# Configuration

## Web app

Set in `.env.local` (development) or as build arguments (production).

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8089` | Where the API runs |
| `VITE_APP_NAME` | `Anjana` | Name in the sidebar, sign-in page and browser tab |
| `VITE_DEMO_MODE` | `false` | Run on built-in sample data, no API needed |
| `VITE_SHOWCASE` | `true` | Include the UI Kit, blocks gallery, sample dashboards and content pages. Set `false` for the build your users get |

## API

Set in `src/main/resources/application.properties`, or as environment variables.

| Variable | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | *(required)* | Token signing key, at least 32 characters |
| `JWT_EXPIRATION` | `8h` | Token lifetime (`30m`, `8h`, `7d`…) |
| `DB_URL` | `jdbc:postgresql://localhost:5432/atelier` | Database |
| `DB_USERNAME` / `DB_PASSWORD` | `atelier` / `atelier` | Database login |
| `PORT` | `8089` | HTTP port |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Web addresses allowed to call the API, comma-separated |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `Administrator` / `admin@example.com` / `ChangeMe123!` | First super admin (first start only) |
| `DEMO_USERS` | `false` | Add four sample users (password `Password123!`) |
| `MAX_LOGIN_ATTEMPTS` / `LOGIN_LOCKOUT` | `5` / `15m` | Brute-force protection |
| `AUDIT_RETENTION_MONTHS` | `3` | Months of audit log to keep |
| `AUDIT_DATA_CHANGES` | `true` | Record row-level before/after values |
| `BRAND_NAME` | `Anjana` | Name in emails and authenticator apps |
| `WEB_URL` | `http://localhost:5173` | The web app's address, for links in emails |
| `REGISTRATION_ENABLED` | `true` in the example file | Allow self sign-up |
| `REGISTRATION_REQUIRE_VERIFICATION` | `true` | New accounts confirm their email before signing in |
| `REGISTRATION_DEFAULT_ROLE` | `USER` | Role given to new sign-ups |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | –, `587` | SMTP server; empty host writes emails to the log |
| `MAIL_FROM` | `no-reply@example.com` | Sender address |
