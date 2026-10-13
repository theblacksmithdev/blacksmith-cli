# Blacksmith CLI

**Django, Express, FastAPI, or Spring Boot + React or Vue framework — one command, one codebase, one mental model.**

Blacksmith scaffolds production-ready web applications with a Django, Express, FastAPI, or Spring Boot backend, a
React or Vue frontend, or both — wired together through automatic OpenAPI synchronization. Choose your project
type and Blacksmith handles the rest.

## Why Blacksmith?

Building web apps usually means gluing together separate projects, manually keeping types in sync, and writing boilerplate. Blacksmith eliminates that friction:

- **Flexible project types** — scaffold a fullstack app, a standalone API, or a standalone frontend
- **Four backends, one API** — Django (Python, DRF), Express (TypeScript, Prisma), FastAPI
  (Python, Pydantic), or Spring Boot (Java, Spring Data JPA). All four expose the same HTTP
  contract, so the generated frontend is identical whichever you pick
- **Two frontends** — React (Chakra UI) or Vue (Nuxt UI). Same pages, same auth flow, same
  generated API client, with any backend
- **Automatic API sync** — change a serializer or Zod schema, get updated TypeScript types and API client instantly (fullstack)
- **Resource scaffolding** — `make:resource BlogPost` creates everything you need for the resource based on your project type
- **AI-ready** — generates `CLAUDE.md` and skill files so AI coding assistants understand your entire stack
- **Clean ejection** — remove Blacksmith at any time and keep a standard project

## Quick Start

### Prerequisites

- **Node.js** >= 20.5.0 and **npm**
- **Python 3** — for a Django or FastAPI backend (not needed for Express or Spring Boot)
- **Java 17+** (a JDK) — for a Spring Boot backend only

### Installation

```bash
npm install -g blacksmith-cli
```

### Create a Project

```bash
blacksmith init my-app
```

You'll be prompted for project type and configuration, or pass flags to skip prompts:

```bash
# Fullstack with the default Django backend
blacksmith init my-app --type fullstack

# Fullstack with an Express + Prisma backend
blacksmith init my-app --type fullstack --backend express

# Fullstack with a FastAPI + Pydantic backend
blacksmith init my-app --type fullstack --backend fastapi

# Fullstack with a Spring Boot (Java) backend
blacksmith init my-app --type fullstack --backend spring

# Backend only
blacksmith init my-app --type backend --backend django

# Frontend only (React)
blacksmith init my-app --type frontend

# Fullstack with a Vue frontend
blacksmith init my-app --type fullstack --frontend vue

# With all options
blacksmith init my-app --type fullstack --backend express -b 8000 -f 5173 --theme-color blue --ai
```

### Start Developing

```bash
cd my-app
blacksmith dev
```

What starts depends on your project type:
- **Fullstack**: backend + Vite + OpenAPI watcher (auto-syncs types on backend changes)
- **Backend**: the backend development server
- **Frontend**: Vite dev server with HMR

## Commands

| Command | Description |
|---|---|
| `blacksmith init [name]` | Create a new project (interactive or via flags) |
| `blacksmith dev` | Start development server(s) |
| `blacksmith sync` | Regenerate frontend API client from the backend schema (fullstack only) |
| `blacksmith make:resource <Name>` | Scaffold a resource (scope depends on project type) |
| `blacksmith build` | Production build |
| `blacksmith eject` | Remove Blacksmith, keep a clean project |
| `blacksmith setup` | Set up the entire project (backend + frontend) |
| `blacksmith setup:ai` | Generate/regenerate CLAUDE.md with AI development skills |
| `blacksmith setup:backend` | Set up the backend (Python venv + deps, `npm install`, or Gradle build, depending on the framework) |
| `blacksmith setup:frontend` | Set up the frontend (install Node.js, install deps) |
| `blacksmith skills` | List available AI skills |
| `blacksmith backend <cmd>` | Run a backend command (`manage.py` for Django, `npm` for Express, `python -m` for FastAPI, `./gradlew` for Spring Boot) |
| `blacksmith frontend <cmd>` | Run an npm command in the frontend |

## Project Structures

### Fullstack (`--type fullstack`)

```
my-app/
├── backend/                  # Django project (Express uses src/ + prisma/, FastAPI uses app/ + migrations/, Spring Boot uses src/main/ + build.gradle)
│   ├── config/               # Settings, URLs, WSGI/ASGI
│   ├── apps/                 # Django apps (one per resource)
│   │   └── users/            # Built-in user app with JWT auth
│   ├── manage.py
│   └── venv/                 # Python virtual environment
├── frontend/                 # React or Vue + Vite project
│   ├── src/
│   │   ├── api/              # Auto-generated API client + hooks (composables in Vue)
│   │   ├── features/         # Feature modules (auth, etc.)
│   │   ├── pages/            # Top-level page components
│   │   ├── router/           # Router with auth guards
│   │   └── shared/           # Shared components, hooks, utils
│   └── package.json
├── blacksmith.config.json
└── CLAUDE.md                 # AI development guide (with --ai)
```

### Backend Only (`--type backend`)

```
my-app/
├── config/                   # Settings, URLs, WSGI/ASGI
├── apps/                     # Django apps
│   └── users/                # Built-in user app with JWT auth
├── manage.py
├── venv/
└── blacksmith.config.json
```

### Frontend Only (`--type frontend`)

```
my-app/
├── src/
│   ├── api/                  # API hooks or composables
│   ├── pages/                # Page components
│   ├── router/               # Router
│   └── shared/               # Shared components, hooks, utils
├── package.json
└── blacksmith.config.json
```

## Tech Stack

### Backend
- **Django** with split settings (base/development/production)
- **Django REST Framework** for API endpoints
- **drf-spectacular** for OpenAPI schema generation
- **SimpleJWT** for token-based authentication
- **django-environ** for environment variable management

With `--backend express` the backend is instead **Express 5** + **Prisma** + **Zod** +
**zod-to-openapi**, in TypeScript, exposing the same HTTP API.

With `--backend fastapi` the backend is instead **FastAPI** + **Pydantic** +
**SQLAlchemy**, in Python, exposing the same HTTP API.

With `--backend spring` the backend is instead **Spring Boot 4** + **Spring Data JPA** +
**Spring Security** (JWT) + **Flyway** + **springdoc-openapi**, in Java 17+ built with Gradle,
exposing the same HTTP API.

### Frontend
- **React 19** with TypeScript (strict mode)
- **Vite** for fast builds and HMR
- **React Router v7** for client-side routing
- **TanStack React Query** for server state management
- **React Hook Form** + **Zod** for forms and validation
- **Chakra UI v3** for components, with an OpenAI-inspired light/dark theme
- **@hey-api/openapi-ts** for API client generation

With `--frontend vue` the frontend is instead **Vue 3.5** (`<script setup>`) + **Vue Router 4** +
**Pinia** + **TanStack Vue Query** + **Nuxt UI v4** on **Tailwind CSS v4**, type-checked with
`vue-tsc` and tested with `@testing-library/vue`, with the same pages and theme presets.

## Resource Scaffolding

The `make:resource` command generates files based on your project type:

```bash
blacksmith make:resource BlogPost
```

**Backend** (fullstack and backend projects):
- `apps/blog_posts/` — model, serializer, viewset, urls, admin, tests
- Automatically registered in `INSTALLED_APPS` and `config/urls.py`
- Migrations run automatically
- On Spring Boot: an `app.blogposts` package (entity, repository, service, controller, records, JUnit tests) and the next Flyway migration

**Frontend** (fullstack and frontend projects):
- `src/api/hooks/blog-posts/` (React) or `src/api/composables/blog-posts/` (Vue) — query and mutation code
- `src/pages/blog-posts/` — paginated list page with a create dialog, detail page with edit and delete, form, tests
- Routes auto-registered

**Fullstack**: Also runs `blacksmith sync` to generate TypeScript types from the new endpoint.

## OpenAPI Sync (Fullstack Only)

Blacksmith bridges the backend and the frontend through OpenAPI:

1. The backend serves an OpenAPI schema — Django via `drf-spectacular`, Express via its
   OpenAPI registry, FastAPI natively, Spring Boot via `springdoc-openapi`
2. `@hey-api/openapi-ts` generates a typed API client from that schema
3. During `blacksmith dev`, a file watcher detects backend changes and re-syncs automatically

You never manually write API client code — it's always generated from your Django serializers and viewsets.

## AI Development Support

With the `--ai` flag, Blacksmith generates documentation that helps AI coding assistants (like Claude Code) understand your project:

```bash
blacksmith init my-app --ai
# or add it later:
blacksmith setup:ai
```

This creates:
- **CLAUDE.md** — project overview, commands, workflow, and conventions
- **.claude/skills/** — detailed skill files tailored to your project type (skills for the project's own backend framework, React or Vue skills for its frontend, both for fullstack)

## Configuration

Project settings live in `blacksmith.config.json`:

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "type": "fullstack",
  "backend": { "port": 8000, "framework": "django" },
  "frontend": { "port": 5173, "framework": "react" }
}
```

- `type` — `"fullstack"`, `"backend"`, or `"frontend"`
- `backend` — present for fullstack and backend projects; `framework` is `django`, `express`, `fastapi`, or `spring` (absent means `django`)
- `frontend` — present for fullstack and frontend projects; `framework` is `react` or `vue` (absent means `react`)

## Ejecting

If you outgrow Blacksmith or want full control, eject cleanly:


```bash
blacksmith eject
```

This removes the Blacksmith dependency and configuration, leaving you with a standard project that runs independently.

## License

MIT
