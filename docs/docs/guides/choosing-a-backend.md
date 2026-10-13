---
sidebar_position: 2
---

# Choosing a Backend

Blacksmith generates one of four backends: **Django**, **Express**, **FastAPI**, or
**Spring Boot**. All four expose the same HTTP API, so the frontend is identical whichever you pick and
you are choosing a team and an ecosystem, not an API design.

```bash
blacksmith init my-app --backend django    # default
blacksmith init my-app --backend express
blacksmith init my-app --backend fastapi
blacksmith init my-app --backend spring
```

Omit the flag and `init` asks. The frontend is a separate choice — see
[Choosing a Frontend](./choosing-a-frontend.md).

## At a Glance

| | Django | Express | FastAPI | Spring Boot |
|---|--------|---------|---------|-------------|
| Language | Python 3.8+ | TypeScript (Node 20+) | Python 3.8+ | Java 17+ |
| Framework | Django + Django REST Framework | Express 5 | FastAPI | Spring Boot 4.1 (Web MVC), built with Gradle 9 |
| ORM | Django ORM | Prisma | SQLAlchemy 2.0 | Spring Data JPA (Hibernate) + Flyway |
| Validation | DRF serializers | Zod | Pydantic | Bean Validation |
| OpenAPI | drf-spectacular | zod-to-openapi | Built into FastAPI | springdoc-openapi |
| Auth | SimpleJWT | jsonwebtoken + bcrypt | PyJWT + bcrypt | Spring Security + JWT |
| Admin UI | Django admin, included | none (use Prisma Studio) | none | none |
| Tests | pytest + pytest-django | Vitest + Supertest | pytest + httpx | JUnit 5 + MockMvc |
| Resource layout | `apps/<name>/` | `src/modules/<name>/` | `app/<name>/` package | `app.<name>` package |

## Pick Django If

- Your team writes Python, or the project has data-science or ML neighbours
- You want the **Django admin** — a working CRUD back office for free is a
  genuine time saver, and Express has no equivalent
- You want the largest batteries-included ecosystem: permissions, signals,
  management commands, mature third-party packages

## Pick Express If

- Your team writes TypeScript and you would rather not run two languages
- You want **one type system end to end** — Prisma and Zod types flow into the
  same generated client the frontend consumes
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
  a small `app/` package you own, no admin, and Alembic for migrations

## Pick Spring Boot If

- Your team writes Java, or the API has to live alongside existing JVM services
- You want a statically typed, compiled backend with the Spring ecosystem behind
  it: Spring Data JPA, Spring Security, Bean Validation, and Flyway migrations
- You can live with a slower edit loop: a saved `.java` file is live a few
  seconds later rather than in a second or two

## What Is Identical

Because the Express, FastAPI and Spring Boot backends reproduce DRF's wire format, these do not change:

- Every URL, including trailing slashes
- Pagination — `{ count, next, previous, results }`
- Error bodies — `detail`, `non_field_errors`, and per-field errors
- snake_case JSON field names
- OpenAPI operation IDs, so the generated frontend queries have the same names
- The whole `frontend/` tree, the auth flow, and every generated page

`blacksmith dev`, `sync`, `test` and `make:resource` behave the same on all
four; only what they run underneath differs. `build` runs each backend's own
production step; see the Build row below.

## What Differs Day to Day

| Task | Django | Express | FastAPI | Spring Boot |
|------|--------|---------|---------|-------------|
| Add a resource | `blacksmith make:resource Post` | same command | same command | same command |
| Where the model goes | `apps/posts/models.py` | `prisma/schema.prisma` | `app/posts/models.py` | `src/main/java/app/posts/Post.java` |
| Migrate | `blacksmith backend makemigrations && ... migrate` | `blacksmith backend exec prisma migrate dev` | `blacksmith backend alembic revision --autogenerate -m "..." && ... alembic upgrade head` | add a Flyway file in `src/main/resources/db/migration/`; it applies when the app starts |
| Create an admin user | `blacksmith backend createsuperuser` | no admin; use Prisma Studio | no admin; use `POST /api/auth/register/` | no admin; use `POST /api/auth/register/` |
| Browse data | Django admin at `/admin/` | `blacksmith backend exec prisma studio` | no admin; use your own SQL client | no admin; use your own SQL client |
| Run a management command | `blacksmith backend <command>` | `blacksmith backend run <script>` | `blacksmith backend <module>` (`python -m`) | `blacksmith backend <task>` (`./gradlew`) |
| Build for production | `collectstatic` | `tsc` into `dist/` | nothing to build | `bootJar` into `build/libs/app.jar` |

## Switching Later

There is no automated migration between the four. The frontend and the API
contract carry over unchanged, but the backend is a rewrite — Django models
become a Prisma schema, SQLAlchemy models or JPA entities, DRF serializers become
Zod or Pydantic schemas or Java records, viewsets become service/controller pairs,
FastAPI routers or Spring controllers.

Because the contract is identical, a gradual migration is possible: run both
backends and move endpoints across behind a proxy. That is a manual exercise;
Blacksmith does not automate it.

## Existing Projects

Projects generated before Express support have no `backend.framework` field in
`blacksmith.config.json`. That absence reads as `django`, so they keep working
untouched — nothing to migrate. Express, FastAPI and Spring Boot projects record their
framework in the field, so the CLI always knows which toolchain to use.
