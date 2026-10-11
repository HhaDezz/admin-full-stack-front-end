# Deployment

## Web app

```bash
npm run build      # type-checks, then writes static files to dist/
```

Serve `dist/` from any static host (Nginx, Netlify, Vercel, S3 + CloudFront) with unknown paths falling back to `index.html`. The included `nginx.conf` does that and caches fingerprinted assets for a year.

Set these at build time:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com VITE_SHOWCASE=false npm run build
```

`VITE_SHOWCASE=false` leaves out the UI Kit, blocks gallery, sample dashboards and content pages, for the build your users get. Demo data is never bundled unless `VITE_DEMO_MODE=true`.

### A public demo

To host a clickable demo, run `npm run build:demo` (or build with `VITE_DEMO_MODE=true`). It needs no API and resets for each visitor's browser tab. The sign-in form is filled in with the demo account, so visitors are one click away from the dashboard.

Both hosts are configured already:

- **Netlify:** `netlify.toml` builds in demo mode and serves `index.html` for every path. Connect the repository and deploy.
- **Vercel:** `vercel.json` does the same.

Without a build step at all, drag a folder holding `anjana-admin-demo.html` (renamed to `index.html`) onto Netlify Drop.

## API

```bash
./mvnw -DskipTests package
java -jar target/atelier-api-1.0.0.jar
```

Pass settings as environment variables (see [Configuration](./configuration)). Flyway runs migrations on start.

Before going live:

- Set a strong `JWT_SECRET` and keep it secret. Changing it signs everyone out and turns two-step sign-in off in practice (people set it up again).
- Change the super admin password, or set `ADMIN_PASSWORD` before the first start.
- Set `CORS_ALLOWED_ORIGINS` to your web app's address only.
- Run behind HTTPS. The audit log reads the client address from `X-Forwarded-For`.
- Configure SMTP and `WEB_URL` (see [Email](./email)).
- Rate limits and lockouts are counted in memory per instance.

## Docker Compose

`docker-compose.yml` in the API folder runs PostgreSQL, the API and the web app:

```bash
cp .env.example .env     # JWT_SECRET, ADMIN_PASSWORD, WEB_URL, MAIL_* …
docker compose up -d --build
```

The web app is on port 8081 and the API on 8089. Put a reverse proxy with HTTPS in front for production.
