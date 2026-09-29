# todo-app

A multi-user todo application built with **Next.js 16 (App Router, TypeScript)**, **Prisma** (SQLite locally, PostgreSQL in production), **Auth.js** and **Tailwind CSS**. The API and the frontend live in the same Next.js project.

## Features

- Create, edit and delete tasks with a title and description
- Statuses: **Backlog, Pending, In Progress, Completed**. Every status change is recorded with a timestamp and shown as a progress history on the task
- Task list shows serial number, title, status and a formatted timestamp. Click a task to see its description and history
- Filter by status, sort by created / updated / status-changed time (asc or desc)
- Pagination with 10 or 15 tasks per page
- Email + password sign-in. No public sign-up; **admins create users**
- Admins see and manage every user's tasks and can filter by user

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env        # then set AUTH_SECRET and the admin credentials
npm run db:migrate          # creates prisma/dev.db
npm run db:seed             # creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                 # http://localhost:3000
```

Sign in with the admin account, then open **Users** to create more accounts.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite, or a `postgres://` / `postgresql://` URL for PostgreSQL (see below) |
| `AUTH_SECRET` | yes | Secret used to sign session cookies. Generate one with `npx auth secret` |
| `ADMIN_EMAIL` | for seeding | Email of the first admin created by `npm run db:seed` |
| `ADMIN_PASSWORD` | for seeding | Password of that admin. Use a strong one outside local development |
| `ADMIN_NAME` | no | Display name of that admin (default `Administrator`) |

Values set in the shell or in Vercel take precedence over `.env`.

## Databases: SQLite locally, PostgreSQL in production

The scheme of `DATABASE_URL` picks the database. Every Prisma command goes through `prisma.config.ts`, which selects the matching schema and migrations folder:

| `DATABASE_URL` | Database | Schema / migrations |
|---|---|---|
| `file:./dev.db` | SQLite | `prisma/schema.prisma`, `prisma/migrations/` |
| `postgres://…` or `postgresql://…` | PostgreSQL | `prisma/postgres/schema.prisma`, `prisma/postgres/migrations/` |

The two schemas differ only in the datasource provider, and `tests/schema-sync.test.ts` fails if their models drift apart.

**Changing the schema:** edit both schema files the same way, then create a migration for each database:

```bash
# SQLite (uses DATABASE_URL from .env)
npm run db:migrate -- --name my_change

# PostgreSQL: point at a development database, never production
DATABASE_URL="postgresql://..." npm run db:migrate -- --name my_change
```

In PowerShell, set the variable first: `$env:DATABASE_URL="postgresql://..."; npm run db:migrate -- --name my_change`, then `Remove-Item Env:DATABASE_URL` afterwards.

The generated Prisma client matches the database that was active when it was generated. After pointing `DATABASE_URL` somewhere else, run `npx prisma generate`. The `postinstall` and `vercel-build` scripts do this automatically.

## Deploying to Vercel with PostgreSQL (e.g. Aiven)

1. Import the GitHub repo at vercel.com/new. The production branch is `main`.
2. In Project → Settings → Environment Variables, add:
   - `DATABASE_URL`: your Aiven service URI with `sslmode=require` kept, for example `postgres://avnadmin:PASSWORD@HOST:PORT/defaultdb?sslmode=require&connection_limit=5`. `connection_limit` keeps each serverless instance from using up Aiven's connection limit.
   - `AUTH_SECRET`: a new random string (`npx auth secret`).
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (a strong one) and `ADMIN_NAME`.
3. Deploy. Vercel runs `npm run vercel-build`, which generates the Postgres client, applies migrations with `prisma migrate deploy`, and builds the app.
4. After the first successful deploy, create the first admin once from your machine. The seed script skips this if the admin already exists.
   ```bash
   DATABASE_URL="postgres://...aiven..." ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="a-strong-password" npm run db:seed
   npx prisma generate   # switch your local Prisma client back to SQLite
   ```
   PowerShell:
   ```powershell
   $env:DATABASE_URL="postgres://...aiven..."; $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a-strong-password"
   npm run db:seed
   Remove-Item Env:DATABASE_URL, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
   npx prisma generate
   ```
5. Open the Vercel URL and sign in as that admin. Every push to `main` redeploys, and new migrations are applied during the build.

### Troubleshooting

- **`the URL must start with the protocol postgresql://` (or `file:`)**: the Prisma client was generated for the other database. Run `npx prisma generate` with the right `DATABASE_URL`.
- **`Unsupported DATABASE_URL scheme`**: only `file:`, `postgres://` and `postgresql://` URLs are supported.
- **Too many connections on Aiven**: lower `connection_limit` in `DATABASE_URL`, or use Aiven's connection pooler URI.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit + integration tests against a throwaway SQLite `prisma/test.db`) |
| `npm run db:migrate` | Create and apply migrations for the database in `DATABASE_URL` |
| `npm run db:seed` | Create the initial admin user |
| `npm run vercel-build` | Used by Vercel: `prisma generate`, `prisma migrate deploy`, `next build` |

## API

All endpoints need a signed-in session. Errors are JSON `{ error, details? }`.

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/tasks` | any user | Query: `status`, `sort` (`createdAt`\|`updatedAt`\|`statusChangedAt`), `order` (`asc`\|`desc`), `page`, `pageSize` (10\|15), `userId` (admins only). Returns `{ items, page, pageSize, total, totalPages }` |
| POST | `/api/tasks` | any user | `{ title, description?, status? }` |
| GET | `/api/tasks/:id` | owner or admin | Includes `description` and `statusEvents` |
| PATCH | `/api/tasks/:id` | owner or admin | Any of `{ title, description, status }` |
| DELETE | `/api/tasks/:id` | owner or admin | |
| GET | `/api/users` | admin | |
| POST | `/api/users` | admin | `{ email, name, password, role? }` |

Other users' tasks return 404 rather than 403, so task ids aren't leaked.

## Project layout

```
prisma.config.ts          picks the SQLite or PostgreSQL schema from DATABASE_URL
prisma/schema.prisma      User, Task, TaskStatusEvent models (SQLite)
prisma/postgres/          the same models for PostgreSQL, plus their migrations
prisma/seed.ts            initial admin
src/auth.ts               Auth.js config (credentials provider, JWT session with id + role)
src/proxy.ts              route protection (Next 16's replacement for middleware)
src/lib/                  tasks, users, authz, validation (zod), formatting
src/app/api/              route handlers
src/app/(app)/            signed-in pages: task list, task detail, new task, admin/users
src/app/login/            sign-in page
src/components/           UI components
tests/                    Vitest tests
```
