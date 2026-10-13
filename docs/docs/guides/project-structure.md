---
sidebar_position: 1
---

# Project Structure

:::note Express backends
The layouts below show the Django backend. An Express backend replaces `apps/`, `config/`,
`manage.py` and `venv/` with `src/` (config, db, middleware, modules, utils), `prisma/` and
`package.json`. See [Express Backend](../stack/backend-express.md).
:::

:::note FastAPI backends
A FastAPI backend keeps the Python layout (`venv/`, `requirements.txt`, `tests/`) but
replaces `apps/`, `config/` and `manage.py` with an `app/` package (main, config, db,
routers, and one package per resource), Alembic migrations in `migrations/`, and a
`scripts.py` that exports the OpenAPI schema. See
[Choosing a Backend](../guides/choosing-a-backend.md) for how the backends compare.
:::

:::note Spring Boot backends
A Spring Boot backend replaces `apps/`, `config/`, `manage.py`, `requirements.txt` and
`venv/` with a Gradle project (no virtual environment). See
[Spring Boot Backend](../stack/backend-spring.md).

```
backend/
├── build.gradle
├── settings.gradle
├── gradlew                         # Gradle wrapper (downloads Gradle on first use)
├── gradle/wrapper/
├── src/main/java/app/
│   ├── Application.java
│   ├── auth/                       # JWT auth controller, service, token filter, DTOs
│   ├── config/                     # Security, OpenAPI and app properties
│   ├── errors/                     # DRF-style error responses
│   ├── docs/                       # ReDoc page
│   └── users/                      # User entity and repository
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/               # Flyway migrations (V1__create_users.sql)
├── src/test/java/app/              # ApiTest, MigrationsTest, OpenApiDocumentTest,
│                                   # OpenApiExport, auth/AuthApiTest
├── src/test/resources/application-test.yml
├── .gitignore                      # Ignores .gradle/, build/, .env, data/
├── .env
└── .env.example
```
:::


The generated structure depends on the project type selected during `blacksmith init`.

## Fullstack (`--type fullstack`)

Both the backend (Django here) and the frontend (React here) live in subdirectories. A Vue frontend sits in the same `frontend/` directory; see [Vue frontend layout](#vue-frontend-layout) below.

```
my-app/
├── blacksmith.config.json          # Project configuration (type: "fullstack")
├── .gitignore                      # Ignores venv/, node_modules/, .env, build output
├── .github/workflows/ci.yml        # Runs both test suites on push and PR
├── CLAUDE.md                       # AI development guide (with --ai flag)
│
├── backend/                        # Django project
│   ├── config/                     # Django configuration
│   │   ├── settings/
│   │   │   ├── base.py             # Shared settings
│   │   │   ├── development.py      # Development-specific settings
│   │   │   ├── production.py       # Production-specific settings
│   │   │   └── test.py             # Settings used by the pytest suite
│   │   ├── urls.py                 # Root URL configuration
│   │   ├── wsgi.py                 # WSGI entry point
│   │   └── asgi.py                 # ASGI entry point
│   ├── apps/                       # Django applications
│   │   └── users/                  # Pre-built user auth app (with tests.py)
│   ├── utils/                      # Shared backend utilities
│   ├── conftest.py                 # Shared pytest fixtures
│   ├── pytest.ini                  # pytest + pytest-django configuration
│   ├── manage.py
│   ├── requirements.txt
│   ├── venv/                       # Python virtual environment (git-ignored)
│   ├── .gitignore
│   ├── .env
│   └── .env.example
│
├── frontend/                       # React + Vite project
│   ├── src/
│   │   ├── __tests__/              # Vitest setup and shared test utilities
│   │   ├── api/                    # API client layer
│   │   │   ├── generated/          # Auto-generated from OpenAPI (do not edit)
│   │   │   └── hooks/              # Resource API hooks
│   │   ├── features/               # Feature modules (auth, etc.)
│   │   ├── pages/                  # Page components
│   │   ├── router/                 # React Router with auth guards
│   │   ├── shared/                 # Shared components, hooks, utils
│   │   └── theme/                  # Chakra UI design system and presets
│   ├── node_modules/               # Node dependencies (git-ignored)
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.ts
│
└── .claude/                        # AI skill files (with --ai flag)
    └── skills/
```

## Backend Only (`--type backend`)

Django project lives at the root — no `backend/` wrapper directory:

```
my-api/
├── blacksmith.config.json          # Project configuration (type: "backend")
├── config/                         # Django configuration
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/                           # Django applications
│   └── users/                      # Pre-built user auth app
├── utils/                          # Shared utilities
├── manage.py
├── requirements.txt
├── venv/                           # git-ignored
├── .gitignore
├── .env
└── .env.example
```

## Frontend Only (`--type frontend`)

The frontend (React or Vue) lives at the root — no `frontend/` wrapper directory. The React layout:

```
my-ui/
├── blacksmith.config.json          # Project configuration (type: "frontend")
├── src/
│   ├── api/
│   │   └── hooks/                  # API hooks
│   ├── features/                   # Feature modules (auth, etc.)
│   ├── pages/                      # Page components
│   ├── router/                     # React Router
│   ├── shared/                     # Shared components, hooks, utils
│   └── theme/
├── node_modules/                   # git-ignored
├── .gitignore
├── package.json
└── vite.config.ts
```

## Vue Frontend Layout

With `--frontend vue`, `frontend/` (or the root of a frontend-only project) holds:

```
frontend/
├── src/
│   ├── __tests__/                  # Vitest setup and renderWithProviders
│   ├── api/
│   │   ├── generated/              # Auto-generated from OpenAPI (do not edit)
│   │   └── composables/            # Resource API composables
│   ├── features/                   # Feature modules (auth: adapter, Pinia store, pages)
│   ├── pages/                      # One folder per page, PascalCase .vue files
│   ├── router/                     # Routes, auth guard, layouts, Path enum
│   ├── shared/                     # Shared components, composables, utils
│   ├── theme/                      # main.css, presets.ts, ui-config.ts
│   ├── App.vue
│   ├── plugins.ts                  # Pinia, router, Vue Query, Nuxt UI
│   └── main.ts
├── eslint.config.js
├── package.json
└── vite.config.ts
```

See [Frontend Stack: Vue](/docs/stack/frontend-vue).

## Tests

Both sides ship with a working suite, and `make:resource` adds tests for every
resource you generate. See the [Testing guide](./testing.md).

| | Backend | Frontend |
|---|---|---|
| Runner | pytest + pytest-django | Vitest |
| Config | `pytest.ini` | `test` block in `vite.config.ts` |
| Fixtures / helpers | `conftest.py` | `src/__tests__/test-utils.tsx` (React) or `test-utils.ts` (Vue) |
| Test files | `apps/<app>/tests.py` | `__tests__/*.spec.tsx` (React) or `*.spec.ts` (Vue) beside the source |
| Run it | `blacksmith test --backend` | `blacksmith test --frontend` |

## Ignored Files

Every generated project ships with a `.gitignore`, so `git add .` never picks up
dependencies or secrets. Fullstack projects get one at the root plus one in each
of `backend/` and `frontend/`; single-stack projects get one at the root.

| Ignored | Where |
|---------|-------|
| `venv/`, `.venv/` | backend |
| `node_modules/` | frontend |
| `__pycache__/`, `*.pyc` | backend |
| `.env`, `.env.local` | both |
| `db.sqlite3`, `staticfiles/`, `media/` | backend |
| `.gradle/`, `build/`, `data/` | backend (Spring Boot) |
| `dist/`, `coverage/` | frontend |
| `src/api/generated/` | frontend (regenerated by `blacksmith sync`) |
| `.DS_Store`, `.vscode/`, `.idea/` | both |

These files are also written by `blacksmith setup`, so a project created with an
older CLI version picks them up before `venv/` or `node_modules/` is created. An
existing `.gitignore` is never overwritten.

## Key Directories

### `config/settings/` (backend)

Django uses split settings for different environments:

- **`base.py`** — Shared settings (installed apps, middleware, REST framework config). Contains marker comments (`# blacksmith:apps`, `# blacksmith:urls`) for automatic resource registration
- **`development.py`** — Debug mode, CORS settings, SQLite database
- **`production.py`** — Security settings, production database config

### `apps/` (backend)

Each Django app lives in its own directory. The `users` app is pre-built with authentication. Resources created with `make:resource` are added here.

### `src/api/generated/` (frontend, fullstack)

Auto-generated files from the OpenAPI schema. **Do not edit these files manually** — they are overwritten on every sync.

### `src/api/hooks/` (React) or `src/api/composables/` (Vue)

Resource-specific API code generated by `make:resource`. Each resource gets its own folder containing query and mutation hooks (React) or composables (Vue). These are the primary API interface for your pages:

```typescript
import { useProducts, useCreateProduct } from '@/api/hooks/products'        // React
import { useProducts, useCreateProduct } from '@/api/composables/products'  // Vue
```

Unlike the files in `api/generated/`, you own these files and can customize them freely.

### `src/features/` (frontend)

Feature-specific modules. The `auth` feature is pre-built with login, registration, and password reset flows.

### `src/pages/` (frontend)

Page components organized by route. Each page folder includes:
- `components/` — page-specific child components
- `hooks/` (React) or `composables/` (Vue) — page-local UI logic (filtering, pagination, modals — not API calls)

### `src/router/` (frontend)

Router configuration (React Router or Vue Router) with:
- `paths.ts` — Enum of all route paths, shared by both frontends
- Route definitions with auth guards (a wrapper component in React, a `beforeEach` guard on `meta.requiresAuth` in Vue)

## Configuration Markers

Blacksmith uses comment markers to safely inject code when creating resources:

| Marker | File | Purpose |
|--------|------|---------|
| `# blacksmith:apps` | `config/settings/base.py` | Insert new app registrations |
| `# blacksmith:urls` | `config/urls.py` | Insert new API URL routes |
| `// blacksmith:import` | `router/routes.tsx` (React), `router/routes.ts` (Vue) | Insert route imports |
| `// blacksmith:routes` | `router/routes.tsx` (React), `router/routes.ts` (Vue) | Insert route definitions |
| `// blacksmith:path` | `router/paths.ts` | Insert path enum entries |

:::caution
Do not remove or modify these marker comments, or `make:resource` won't be able to register new resources automatically.
:::
