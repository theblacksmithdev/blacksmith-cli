---
sidebar_position: 2
---

# Choosing a Backend

Blacksmith generates one of three backends: **Django**, **Express**, or **FastAPI**. All
three expose the same HTTP API, so the React frontend is identical whichever you pick and
you are choosing a team and an ecosystem, not an API design.

```bash
blacksmith init my-app --backend django    # default
blacksmith init my-app --backend express
blacksmith init my-app --backend fastapi
```

Omit the flag and `init` asks.

## At a Glance

| | Django | Express | FastAPI |
|---|--------|---------|---------|
| Language | Python 3.8+ | TypeScript (Node 20+) | Python 3.8+ |
| Framework | Django + Django REST Framework | Express 5 | FastAPI |
| ORM | Django ORM | Prisma | SQLAlchemy 2.0 |
| Validation | DRF serializers | Zod | Pydantic |
| OpenAPI | drf-spectacular | zod-to-openapi | Built into FastAPI |
| Auth | SimpleJWT | jsonwebtoken + bcrypt | PyJWT + bcrypt |
| Admin UI | Django admin, included | none (use Prisma Studio) | none |
| Tests | pytest + pytest-django | Vitest + Supertest | pytest + httpx |
| Resource layout | `apps/<name>/` | `src/modules/<name>/` | `app/` package (no resource scaffold yet) |

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

## Pick FastAPI If

- Your team writes Python but wants a modern, async-first, type-hinted API
  rather than Django's admin-oriented machinery
- You want the **OpenAPI schema and docs for free** — Pydantic models are the
  validation and the schema in one, and Swagger UI and ReDoc are served
  automatically at `/api/docs/` and `/api/redoc/` with nothing to configure
- You want Django's Python tooling (venv, pip, pytest) with fewer batteries:
  a small `app/` package you own, no admin, and `scripts.py` in place of
  Django's management commands

## What Is Identical

Because the Express and FastAPI backends reproduce DRF's wire format, these do not change:

- Every URL, including trailing slashes
- Pagination — `{ count, next, previous, results }`
- Error bodies — `detail`, `non_field_errors`, and per-field errors
- snake_case JSON field names
- OpenAPI operation IDs, so the generated React hooks have the same names
- The whole `frontend/` tree, the auth flow, and every generated page

`blacksmith dev`, `sync`, and `test` behave the same on all three; only what
they run underneath differs. A few commands are still catching up with
FastAPI — `make:resource` refuses for now, and the `backend` and `build`
passthroughs still assume Django — so check the table below before using them
on a FastAPI project.

## What Differs Day to Day

| Task | Django | Express | FastAPI |
|------|--------|---------|---------|
| Add a resource | `blacksmith make:resource Post` | same command | not available yet |
| Where the model goes | `apps/posts/models.py` | `prisma/schema.prisma` | `app/db.py` (or a module `app` imports) |
| Migrate | `blacksmith backend makemigrations && ... migrate` | `blacksmith backend exec prisma migrate dev` | `./venv/bin/python scripts.py init-db` (create_all — no migration files) |
| Create an admin user | `blacksmith backend createsuperuser` | no admin; use Prisma Studio | no admin; use `POST /api/auth/register/` |
| Browse data | Django admin at `/admin/` | `blacksmith backend exec prisma studio` | no admin; use your own SQL client |
| Run a management command | `blacksmith backend <command>` | `blacksmith backend run <script>` | `./venv/bin/python scripts.py <command>` |

## Switching Later

There is no automated migration between the three. The frontend and the API
contract carry over unchanged, but the backend is a rewrite — Django models
become a Prisma schema or SQLAlchemy models, DRF serializers become Zod or
Pydantic schemas, viewsets become service/controller pairs or FastAPI routers.

Because the contract is identical, a gradual migration is possible: run both
backends and move endpoints across behind a proxy. That is a manual exercise;
Blacksmith does not automate it.

## Existing Projects

Projects generated before Express support have no `backend.framework` field in
`blacksmith.config.json`. That absence reads as `django`, so they keep working
untouched — nothing to migrate. Express and FastAPI projects record their
framework in the field, so the CLI always knows which toolchain to use.
