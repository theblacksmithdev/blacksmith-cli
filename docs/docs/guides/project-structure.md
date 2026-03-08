---
sidebar_position: 1
---

# Project Structure

When you run `blacksmith init my-app`, the following structure is generated:

```
my-app/
├── blacksmith.config.json          # Blacksmith project configuration
├── CLAUDE.md                       # AI development guide (with --ai flag)
│
├── backend/                        # Django project
│   ├── config/                     # Django configuration
│   │   ├── settings/
│   │   │   ├── base.py             # Shared settings
│   │   │   ├── development.py      # Development-specific settings
│   │   │   └── production.py       # Production-specific settings
│   │   ├── urls.py                 # Root URL configuration
│   │   ├── wsgi.py                 # WSGI entry point
│   │   └── asgi.py                 # ASGI entry point
│   ├── apps/                       # Django applications
│   │   └── users/                  # Pre-built user auth app
│   │       ├── models.py           # Custom user model
│   │       ├── serializers.py      # User serializers
│   │       ├── views.py            # Auth viewsets
│   │       ├── urls.py             # Auth URL routes
│   │       └── admin.py            # Admin registration
│   ├── manage.py                   # Django management script
│   ├── requirements.txt            # Python dependencies
│   ├── venv/                       # Python virtual environment
│   ├── .env                        # Environment variables
│   └── .env.example                # Environment template
│
├── frontend/                       # React + Vite project
│   ├── src/
│   │   ├── api/                    # API client layer
│   │   │   └── generated/          # Auto-generated from OpenAPI
│   │   │       ├── types.gen.ts    # TypeScript interfaces
│   │   │       ├── zod.gen.ts      # Zod validation schemas
│   │   │       ├── sdk.gen.ts      # API client functions
│   │   │       └── @tanstack/
│   │   │           └── react-query.gen.ts  # React Query hooks
│   │   ├── features/              # Feature modules
│   │   │   └── auth/              # Authentication feature
│   │   │       ├── AuthProvider.tsx
│   │   │       ├── LoginPage.tsx
│   │   │       ├── RegisterPage.tsx
│   │   │       └── ...
│   │   ├── pages/                 # Page components
│   │   │   ├── home/
│   │   │   └── dashboard/
│   │   ├── router/                # Routing configuration
│   │   │   ├── index.tsx          # Route definitions
│   │   │   └── paths.ts           # Route path enum
│   │   ├── shared/                # Shared components & utilities
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── styles/                # Global styles
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   ├── openapi-ts.config.ts       # Code generation config
│   ├── vite.config.ts             # Vite configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   ├── tsconfig.json              # TypeScript configuration
│   └── .env                       # Frontend env vars (VITE_API_URL)
│
└── .claude/                        # AI skill files (with --ai flag)
    └── skills/
        └── <skill-id>/
            └── SKILL.md
```

## Key Directories

### `backend/config/settings/`

Django uses split settings for different environments:

- **`base.py`** — Shared settings (installed apps, middleware, REST framework config). Contains marker comments (`# blacksmith:apps`, `# blacksmith:urls`) that Blacksmith uses to inject code when generating resources.
- **`development.py`** — Debug mode, CORS settings, SQLite database
- **`production.py`** — Security settings, production database config

### `backend/apps/`

Each Django app lives in its own directory. The `users` app is pre-built with authentication. Resources created with `make:resource` are added here.

### `frontend/src/api/generated/`

Auto-generated files from the OpenAPI schema. **Do not edit these files manually** — they are overwritten on every sync.

### `frontend/src/features/`

Feature-specific modules. The `auth` feature is pre-built with login, registration, and password reset flows.

### `frontend/src/pages/`

Page components organized by route. Resources created with `make:resource` add their pages here.

### `frontend/src/router/`

React Router configuration with:
- `paths.ts` — Enum of all route paths (Blacksmith adds entries here for new resources)
- `index.tsx` — Route definitions with auth guards

## Configuration Markers

Blacksmith uses comment markers in generated code to safely inject new code when creating resources:

| Marker | File | Purpose |
|--------|------|---------|
| `# blacksmith:apps` | `settings/base.py` | Insert new app registrations |
| `# blacksmith:urls` | `config/urls.py` | Insert new API URL routes |
| `// blacksmith:import` | `router/index.tsx` | Insert route imports |
| `// blacksmith:routes` | `router/index.tsx` | Insert route definitions |
| `// blacksmith:path` | `router/paths.ts` | Insert path enum entries |

:::caution
Do not remove or modify these marker comments, or `make:resource` won't be able to register new resources automatically.
:::
