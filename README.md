# Blacksmith CLI

**Fullstack Django + React framework — one command, one codebase, one mental model.**

Blacksmith scaffolds production-ready web applications with a Django REST backend and a React frontend, wired together through automatic OpenAPI synchronization. Define your API in Django, and Blacksmith generates the TypeScript client, types, and hooks for you.

## Why Blacksmith?

Building fullstack apps usually means gluing together two separate projects, manually keeping types in sync, and writing boilerplate on both sides of the stack. Blacksmith eliminates that friction:

- **One command to scaffold** a complete project with authentication, routing, and API layer already wired up
- **Automatic API sync** — change a Django serializer, get updated TypeScript types and API client instantly
- **Full-stack resource scaffolding** — `make:resource BlogPost` creates the model, serializer, viewset, URLs, hooks, components, and pages
- **AI-ready** — generates a `CLAUDE.md` and skill files so AI coding assistants understand your entire stack
- **Clean ejection** — remove Blacksmith at any time and keep a standard Django + React project

## Quick Start

### Prerequisites

- **Node.js** >= 20.5.0
- **Python 3**
- **npm**

### Installation

```bash
npm install -g blacksmith-cli
```

### Create a Project

```bash
blacksmith init my-app
```

You'll be prompted for configuration (or pass flags to skip prompts):

```bash
blacksmith init my-app \
  --backend-port 8000 \
  --frontend-port 5173 \
  --theme-color blue \
  --ai
```

### Start Developing

```bash
cd my-app
blacksmith dev
```

This starts three processes in parallel:
1. **Django** development server
2. **Vite** dev server with HMR
3. **OpenAPI watcher** that auto-syncs types when backend files change

## Commands

| Command | Description |
|---|---|
| `blacksmith init [name]` | Create a new project (interactive or via flags) |
| `blacksmith dev` | Start Django + Vite + OpenAPI watcher |
| `blacksmith sync` | Regenerate frontend API client from Django schema |
| `blacksmith make:resource <Name>` | Scaffold a CRUD resource across the full stack |
| `blacksmith build` | Production build (Vite + collectstatic) |
| `blacksmith eject` | Remove Blacksmith, keep a clean project |
| `blacksmith setup:ai` | Generate CLAUDE.md with AI development skills |
| `blacksmith skills` | List available AI skills |
| `blacksmith backend <cmd>` | Run a Django management command |
| `blacksmith frontend <cmd>` | Run an npm command in the frontend |

## Generated Project Structure

```
my-app/
├── backend/                  # Django project
│   ├── config/               # Settings, URLs, WSGI/ASGI
│   │   └── settings/         # Split settings (base, development, production)
│   ├── apps/                 # Django apps (one per resource)
│   │   └── users/            # Built-in user app with JWT auth
│   ├── manage.py
│   ├── requirements.txt
│   └── venv/                 # Python virtual environment
├── frontend/                 # React + Vite project
│   ├── src/
│   │   ├── api/              # Auto-generated API client (via OpenAPI)
│   │   ├── features/         # Feature modules (auth, etc.)
│   │   ├── pages/            # Top-level page components
│   │   ├── router/           # React Router with auth guards
│   │   ├── shared/           # Shared components and hooks
│   │   └── styles/           # Global styles (Tailwind CSS)
│   └── package.json
├── blacksmith.config.json    # Project configuration
└── CLAUDE.md                 # AI development guide (with --ai)
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
- **Tailwind CSS** for styling
- **@hey-api/openapi-ts** for API client generation

## Resource Scaffolding

The `make:resource` command generates a complete CRUD feature across both backend and frontend:

```bash
blacksmith make:resource BlogPost
```

**Backend** (in `backend/apps/blog_posts/`):
- `models.py` — Django model
- `serializers.py` — DRF serializer
- `views.py` — DRF viewset
- `urls.py` — URL configuration
- `admin.py` — Admin registration
- `tests.py` — Test scaffold

**Frontend** (in `frontend/src/features/blog-posts/`):
- API hooks for list, detail, create, update, delete
- List and detail page components
- Create and edit form components

After scaffolding, run `blacksmith sync` to generate the TypeScript types.

## OpenAPI Sync

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
- **.claude/skills/** — detailed skill files covering Django, DRF, React, React Query, forms, authentication, and more

## Theme Presets

Choose a theme color during project creation:

```bash
blacksmith init my-app --theme-color violet
```

Available presets: `default`, `blue`, `green`, `violet`, `red`, `neutral`

## Ejecting

If you outgrow Blacksmith or want full control, eject cleanly:

```bash
blacksmith eject
```

This removes the Blacksmith dependency and configuration, leaving you with a standard Django + React project that runs independently.

## Development Workflow

A typical workflow looks like:

1. Create a resource: `blacksmith make:resource Product`
2. Customize the Django model in `backend/apps/products/models.py`
3. Update the serializer in `backend/apps/products/serializers.py`
4. Run `blacksmith sync` to regenerate the frontend API client
5. Build the UI in `frontend/src/features/products/`
6. Check the API docs at `http://localhost:8000/api/docs/`

## Configuration

Project settings live in `blacksmith.config.json`:

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "backend": { "port": 8000 },
  "frontend": { "port": 5173 }
}
```

## License

MIT
