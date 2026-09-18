---
sidebar_position: 1
---

# Project Structure

:::note Express backends
The layouts below show the Django backend. An Express backend replaces `apps/`, `config/`,
`manage.py` and `venv/` with `src/` (config, db, middleware, modules, utils), `prisma/` and
`package.json`. See [Express Backend](../stack/backend-express.md).
:::


The generated structure depends on the project type selected during `blacksmith init`.

## Fullstack (`--type fullstack`)

Both Django and React live in subdirectories:

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
│   │   └── styles/                 # Global styles
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

React project lives at the root — no `frontend/` wrapper directory:

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
│   └── styles/
├── node_modules/                   # git-ignored
├── .gitignore
├── package.json
└── vite.config.ts
```

## Tests

Both sides ship with a working suite, and `make:resource` adds tests for every
resource you generate. See the [Testing guide](./testing.md).

| | Backend | Frontend |
|---|---|---|
| Runner | pytest + pytest-django | Vitest |
| Config | `pytest.ini` | `test` block in `vite.config.ts` |
| Fixtures / helpers | `conftest.py` | `src/__tests__/test-utils.tsx` |
| Test files | `apps/<app>/tests.py` | `__tests__/*.spec.tsx` beside the source |
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

### `src/api/hooks/` (frontend)

Resource-specific API hooks generated by `make:resource`. Each resource gets its own folder containing query and mutation hooks. These are the primary API interface for your pages:

```typescript
import { useProducts, useCreateProduct } from '@/api/hooks/products'
```

Unlike the files in `api/generated/`, you own these files and can customize them freely.

### `src/features/` (frontend)

Feature-specific modules. The `auth` feature is pre-built with login, registration, and password reset flows.

### `src/pages/` (frontend)

Page components organized by route. Each page folder includes:
- `components/` — page-specific child components
- `hooks/` — page-local UI hooks (filtering, pagination, modals — not API hooks)

### `src/router/` (frontend)

React Router configuration with:
- `paths.ts` — Enum of all route paths
- Route definitions with auth guards

## Configuration Markers

Blacksmith uses comment markers to safely inject code when creating resources:

| Marker | File | Purpose |
|--------|------|---------|
| `# blacksmith:apps` | `config/settings/base.py` | Insert new app registrations |
| `# blacksmith:urls` | `config/urls.py` | Insert new API URL routes |
| `// blacksmith:import` | `router/routes.tsx` | Insert route imports |
| `// blacksmith:routes` | `router/routes.tsx` | Insert route definitions |
| `// blacksmith:path` | `router/paths.ts` | Insert path enum entries |

:::caution
Do not remove or modify these marker comments, or `make:resource` won't be able to register new resources automatically.
:::
