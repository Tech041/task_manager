1 **Link to my repository**

https://github.com/Tech041/task_manager

2 **Task Manager**
_A full-stack task management application. Users can view tasks, create new tasks, update a task's status, and filter tasks by status._

_Stack_: React (TypeScript, Vite, Tailwind, React Query, Axios) · Node.js · Express 5 (TypeScript) · PostgreSQL (Neon) · Prisma · Zod · Mocha, Chai and Supertest · GitHub Actions

_Project structure_
task_manager/
├── .github/workflows/ci.yml # CI: runs the backend tests on every push
├── backend/
│ ├── db/
│ │ ├── schema.sql # SQL script that creates the database table
│ │ ├── seed.sql # Sample task records (plain SQL)
│ │ └── queries.sql # SQL equivalents of the queries the API runs
│ ├── prisma/
│ │ ├── schema.prisma # Data model
│ │ ├── migrations/ # Generated SQL migrations (committed)
│ │ └── seed.ts # Seeds 10 sample tasks
│ ├── src/
│ │ ├── common/ # Shared errors and middleware
│ │ ├── lib/prisma.ts # Prisma client instance
│ │ └── module/task/ # route → controller → service → repository
│ ├── test/
│ │ ├── setup.ts # Safety checks, points tests at the test database
│ │ └── task.test.ts # Mocha test suite
│ ├── .env.example
│ └── .mocharc.json
└── client/ # React frontend
├── src/
│ ├── components/
│ ├── hooks/ # React Query hooks
│ ├── pages/
│ ├── services/ # Axios instance and task API calls
│ └── types/
└── .env.example

_Prerequisites_
Node.js 22 or newer (and npm)
A PostgreSQL database. This project uses a free Neon project, but any PostgreSQL 14+ database works.
Git

A. # Installing dependencies

Clone the repository, then install the backend and frontend dependencies separately.

git clone git@github.com:Tech041/task_manager.git

# Backend

cd backend
npm install

# Frontend (from the repository root)

cd frontend
npm install

B. # Configuring environment variables

Real credentials are never committed. Each app ships a .env.example listing the required variable names. Copy it to .env and fill in the values.

C. # Setting up the database

Run these from the `backend/` folder after `DATABASE_URL` is set in `.env`:

```bash
npx prisma generate     # builds the typed Prisma client (once, and after schema changes)
npm run db:deploy       # applies the committed migrations (creates the tasks table)
npm run db:seed         # inserts 10 sample tasks
```

| Script               | Command                 | When to use it                                                                      |
| -------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `npm run db:deploy`  | `prisma migrate deploy` | Setting up a database from the committed migrations                                 |
| `npm run db:migrate` | `prisma migrate dev`    | During development, after changing `prisma/schema.prisma` (creates a new migration) |
| `npm run db:seed`    | `tsx prisma/seed.ts`    | Inserting sample data                                                               |

To create a new migration while developing, pass a name after `--`:

```bash
npm run db:migrate -- --name describe_your_change
```

> **Note:** `npm run db:seed` deletes all existing tasks first so the script can be re-run safely. Do not run it against a database holding data you want to keep.

D. # Running the backend and frontend

# Backend

cd backend
npm run dev
The API starts on http://localhost:PORT (your PORT as defined in .env). A health check is available at GET /health

# Frontend

In a second terminal
cd client
npm run dev

Open the URL Vite prints ( http://localhost:3000). The backend must be running for the task list to load.

# Features

View all tasks, newest first

Create a task (title, description and status are all required)

Change a task's status from the list

Loading indicators and error messages, with a retry button when the list fails to load

Responsive layout: the form and list stack on small screens and sit side by

E. # Running the automated tests

The backend tests are written with Mocha, Chai and Supertest. They are integration tests: each request goes through the real Express app, services and repository to a real PostgreSQL test database.

Before the first run
TEST_DATABASE_URL must be set in backend/.env and must point to a database that is not your application database.
The tasks table must exist in that database

# RUN

cd backend
npm test

3. **The SQL database creation script.**

   npx prisma migrate dev --name create_tasks_table

4.**Your CI workflow configuration.**

name: Backend CI

on:
push:
pull_request:

jobs:
test:
runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: backend

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: tasks_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10

    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tasks_test
      TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tasks_test

    steps:
      - name: Check out code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Apply database migrations
        run: npx prisma migrate deploy

      - name: Run tests
        run: npm test








## Future improvements

Given more time, these are the changes I would make, in order of priority.

### 1. Server-side pagination for `GET /api/tasks`

The endpoint currently returns every task in a single response. That is fine for a small list, but the payload and query time grow with the table. I would paginate on the server and send data in chunks, so the client is never overwhelmed with data, the database does less work per request, and API responses stay fast as the data grows.

**Request**

```
GET /api/tasks?page=1&limit=10&status=IN_PROGRESS
```

- `page` (default `1`) and `limit` (default `10`, capped at `100`) are validated with Zod, like every other input, so invalid values return a clean 400.
- `status` is an optional filter.

**Response**

```json
{
  "data": [
    {
      "id": 1,
      "title": "...",
      "description": "...",
      "status": "PENDING",
      "createdAt": "..."
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 57, "totalPages": 6 }
}
```

**Implementation notes**

- The repository would use Prisma's `skip` and `take`, with a `count` query run in the same transaction so `total` is consistent with the page returned.
- Results need a stable order. I would sort by `createdAt` descending with `id` as a tie-breaker, so a task never appears on two pages or gets skipped.
- The existing index on `status` already supports the filter, and I would add an index on `created_at` for the sort.
- For very large tables, offset pagination gets slower on deep pages, so I would switch to **cursor-based pagination** (`?cursor=<last id>`), which stays fast at any depth.

**Frontend changes**

- Move the status filter to the server. Today the filter runs in the browser over the full list, which stops working once only one page is loaded.
- Use React Query's `keepPreviousData` option (or `useInfiniteQuery` for a "Load more" button) so the list doesn't flash empty between pages.
- Add page controls and show the total count.
- Keep the page and filter in the URL so a refresh or shared link restores the same view.

**Tests to add**

Default page size, a custom `limit`, the last partial page, a page beyond the end (empty `data`), the cap on `limit`, invalid `page` and `limit` values returning 400, and filtering combined with pagination.

### 2. Further improvements

- Edit and delete endpoints for tasks, with the matching UI.
- Search by title.
- Authentication, so each user sees only their own tasks.
- Optimistic updates for status changes, so the UI responds instantly.
- Frontend tests (React Testing Library) and an end-to-end test.
- Request logging, rate limiting and I have already added security headers (`helmet`) on the API.
- API documentation generated from the validation schemas (OpenAPI).
