# todo-app

A multi-user todo application built with **Next.js 16 (App Router, TypeScript)**, **Prisma + SQLite**, **Auth.js** and **Tailwind CSS**. The API and the frontend live in the same Next.js project.

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

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit + integration tests against a throwaway `prisma/test.db`) |
| `npm run db:migrate` | Apply / create Prisma migrations |
| `npm run db:seed` | Create the initial admin user |

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
prisma/schema.prisma      User, Task, TaskStatusEvent models
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
