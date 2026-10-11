# Getting started

Anjana Admin is two projects that work together:

| Folder | What it is | Runs on |
|---|---|---|
| `atelier-admin` | The web app: React 19, TypeScript, Vite | Node 20+ |
| `atelier-api` | The API: Spring Boot 4, Java 17+, PostgreSQL | Java 17+, PostgreSQL 14+ |

## Try it without a back end

The web app has a **demo mode** that runs on built-in sample data. It's the quickest way to look around.

**Nothing to install:** open `anjana-admin-demo.html` from the download in Chrome, Edge, Firefox or Safari. It's the
whole front end in one file (about 4.7 MB), works offline, and keeps your changes in that browser.

**From the source:**

```bash
cd atelier-admin
npm install
npm run demo       # http://localhost:5173, no API or .env.local needed
```

`npm run build:standalone` rebuilds `anjana-admin-demo.html` (in `dist-standalone/`) after you change the code.

Sign in with **demo@anjana.test / demo1234**. Every flow works in demo mode: emails for sign-up and password reset appear in a *demo inbox* on the page, and any six digits pass two-step sign-in (except `000000`, which shows the error).

## Run the real thing

### 1. The API

```bash
createuser -P atelier            # password: atelier
createdb -O atelier atelier

cd atelier-api
cp src/main/resources/application.properties.example src/main/resources/application.properties
export JWT_SECRET=$(openssl rand -base64 48)
./mvnw spring-boot:run           # http://localhost:8089
```

On first start the tables are created and a super admin is added: **admin@example.com / ChangeMe123!**. Change the password after you sign in, or set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before the first start.

### 2. The web app

```bash
cd atelier-admin
npm install
cp .env.example .env.local       # VITE_API_BASE_URL=http://localhost:8089, VITE_DEMO_MODE=false
npm run dev
```

Open http://localhost:5173 and sign in as the super admin.

::: tip Emails in development
Without an SMTP server the API writes every email to its log, link included, so you can finish sign-up and password resets locally. See [Email](./email).
:::

### Or with Docker

```bash
cd atelier-api
cp .env.example .env             # set JWT_SECRET and ADMIN_PASSWORD
docker compose up -d --build
```

Web app on http://localhost:8081, API on http://localhost:8089. Compose expects the web app in `../atelier-admin`.

## What to read next

- [Project structure](./project-structure): where everything lives.
- [Adding a page](./adding-a-page) and [Adding a permission](./adding-a-permission): your first feature.
- [Theming](./theming): make it look like your product.
