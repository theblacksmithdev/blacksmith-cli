---
sidebar_position: 2
---

# Choosing a Backend

Blacksmith generates either a **Django** or an **Express** backend. Both expose
the same HTTP API, so the React frontend is identical either way and you are
choosing a team and an ecosystem, not an API design.

```bash
blacksmith init my-app --backend django    # default
blacksmith init my-app --backend express
```

Omit the flag and `init` asks.

## At a Glance

| | Django | Express |
|---|--------|---------|
| Language | Python 3.12+ | TypeScript (Node 20+) |
| Framework | Django + Django REST Framework | Express 5 |
| ORM | Django ORM | Prisma |
| Validation | DRF serializers | Zod |
| OpenAPI | drf-spectacular | zod-to-openapi |
| Auth | SimpleJWT | jsonwebtoken + bcrypt |
| Admin UI | Django admin, included | none (use Prisma Studio) |
| Tests | pytest + pytest-django | Vitest + Supertest |
| Resource layout | `apps/<name>/` | `src/modules/<name>/` |

## Pick Django If

- Your team writes Python, or the project has data-science or ML neighbours
- You want the **Django admin** — a working CRUD back office for free is a
  genuine time saver, and Express has no equivalent
- You want the largest batteries-included ecosystem: permissions, signals,
  management commands, mature third-party packages

## Pick Express If

- Your team writes TypeScript and you would rather not run two languages
- You want **one type system end to end** — Prisma and Zod types flow into the
  same generated client the React app consumes
- You want a smaller runtime and faster cold starts, or you are deploying to an
  edge/serverless Node platform
- You prefer explicit layers (schemas → service → controller → routes) over
  Django's conventions

## What Is Identical

Because the Express backend reproduces DRF's wire format, these do not change:

- Every URL, including trailing slashes
- Pagination — `{ count, next, previous, results }`
- Error bodies — `detail`, `non_field_errors`, and per-field errors
- snake_case JSON field names
- OpenAPI operation IDs, so the generated React hooks have the same names
- The whole `frontend/` tree, the auth flow, and every generated page

`blacksmith dev`, `sync`, `build`, `test`, `make:resource` and `eject` all
behave the same; only what they run underneath differs.

## What Differs Day to Day

| Task | Django | Express |
|------|--------|---------|
| Add a resource | `blacksmith make:resource Post` | same command |
| Where the model goes | `apps/posts/models.py` | `prisma/schema.prisma` |
| Migrate | `blacksmith backend makemigrations && ... migrate` | `blacksmith backend exec prisma migrate dev` |
| Create an admin user | `blacksmith backend createsuperuser` | no admin; use Prisma Studio |
| Browse data | Django admin at `/admin/` | `blacksmith backend exec prisma studio` |
| Run a management command | `blacksmith backend <command>` | `blacksmith backend run <script>` |

## Switching Later

There is no automated migration between the two. The frontend and the API
contract carry over unchanged, but the backend is a rewrite — models become a
Prisma schema, serializers become Zod schemas, viewsets become
service/controller pairs.

Because the contract is identical, a gradual migration is possible: run both
backends and move endpoints across behind a proxy. That is a manual exercise;
Blacksmith does not automate it.

## Existing Projects

Projects generated before Express support have no `backend.framework` field in
`blacksmith.config.json`. That absence reads as `django`, so they keep working
untouched — nothing to migrate.
