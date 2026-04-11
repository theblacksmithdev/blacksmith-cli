# Blacksmith CLI

**Django + React framework — one command, one codebase, one mental model.**

Blacksmith scaffolds production-ready web applications with Django, React, or both — wired together through automatic OpenAPI synchronization. Choose your project type and Blacksmith handles the rest.

## Why Blacksmith?

Building web apps usually means gluing together separate projects, manually keeping types in sync, and writing boilerplate. Blacksmith eliminates that friction:

- **Flexible project types** — scaffold a fullstack Django + React app, a standalone Django API, or a standalone React frontend
- **Automatic API sync** — change a Django serializer, get updated TypeScript types and API client instantly (fullstack)
- **Resource scaffolding** — `make:resource BlogPost` creates everything you need for the resource based on your project type
- **AI-ready** — generates `CLAUDE.md` and skill files so AI coding assistants understand your entire stack
- **Clean ejection** — remove Blacksmith at any time and keep a standard project

## Quick Start

### Prerequisites

- **Node.js** >= 20.5.0
- **Python 3** (for backend and fullstack projects)
- **npm**

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
# Fullstack (Django + React)
blacksmith init my-app --type fullstack

# Backend only (Django API)
blacksmith init my-app --type backend

# Frontend only (React)
blacksmith init my-app --type frontend

# With all options
blacksmith init my-app --type fullstack -b 8000 -f 5173 --theme-color blue --ai
```

### Start Developing

```bash
cd my-app
blacksmith dev
```

What starts depends on your project type:
- **Fullstack**: Django + Vite + OpenAPI watcher (auto-syncs types on backend changes)
- **Backend**: Django development server
- **Frontend**: Vite dev server with HMR

## Commands

| Command | Description |
|---|---|
| `blacksmith init [name]` | Create a new project (interactive or via flags) |
| `blacksmith dev` | Start development server(s) |
| `blacksmith sync` | Regenerate frontend API client from Django schema (fullstack only) |
| `blacksmith make:resource <Name>` | Scaffold a resource (scope depends on project type) |
| `blacksmith build` | Production build |
| `blacksmith eject` | Remove Blacksmith, keep a clean project |
| `blacksmith setup:ai` | Generate/regenerate CLAUDE.md with AI development skills |
| `blacksmith skills` | List available AI skills |
| `blacksmith backend <cmd>` | Run a Django management command |
| `blacksmith frontend <cmd>` | Run an npm command in the frontend |

## Project Structures

### Fullstack (`--type fullstack`)

```
my-app/
├── backend/                  # Django project
│   ├── config/               # Settings, URLs, WSGI/ASGI
│   ├── apps/                 # Django apps (one per resource)
│   │   └── users/            # Built-in user app with JWT auth
│   ├── manage.py
│   └── venv/                 # Python virtual environment
├── frontend/                 # React + Vite project
│   ├── src/
│   │   ├── api/              # Auto-generated API client + hooks
│   │   ├── features/         # Feature modules (auth, etc.)
│   │   ├── pages/            # Top-level page components
│   │   ├── router/           # React Router with auth guards
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
│   ├── api/                  # API hooks
│   ├── pages/                # Page components
│   ├── router/               # React Router
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

### Frontend
- **React 19** with TypeScript (strict mode)
- **Vite** for fast builds and HMR
- **React Router v7** for client-side routing
- **TanStack React Query** for server state management
- **React Hook Form** + **Zod** for forms and validation
- **Chakra UI** for components
- **@hey-api/openapi-ts** for API client generation

## Resource Scaffolding

The `make:resource` command generates files based on your project type:

```bash
blacksmith make:resource BlogPost
```

**Backend** (fullstack and backend projects):
- `apps/blog_posts/` — model, serializer, viewset, urls, admin, tests
- Automatically registered in `INSTALLED_APPS` and `config/urls.py`
- Migrations run automatically

**Frontend** (fullstack and frontend projects):
- `src/api/hooks/blog-posts/` — query and mutation hooks
- `src/pages/blog-posts/` — list and detail pages
- Routes auto-registered

**Fullstack**: Also runs `blacksmith sync` to generate TypeScript types from the new endpoint.

## OpenAPI Sync (Fullstack Only)

Blacksmith bridges Django and React through OpenAPI:

1. Django serves an OpenAPI schema via `drf-spectacular`
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
- **.claude/skills/** — detailed skill files tailored to your project type (Django skills for backend, React skills for frontend, all for fullstack)

## Configuration

Project settings live in `blacksmith.config.json`:

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "type": "fullstack",
  "backend": { "port": 8000 },
  "frontend": { "port": 5173 }
}
```

- `type` — `"fullstack"`, `"backend"`, or `"frontend"`
- `backend` — present for fullstack and backend projects
- `frontend` — present for fullstack and frontend projects

## Ejecting

If you outgrow Blacksmith or want full control, eject cleanly:

```bash
blacksmith eject
```

This removes the Blacksmith dependency and configuration, leaving you with a standard project that runs independently.

## License

MIT
