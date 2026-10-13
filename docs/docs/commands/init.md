---
sidebar_position: 1
---

# blacksmith init

Scaffold a new backend, frontend, or fullstack project. The backend is Django, Express, FastAPI, or Spring Boot —
see [Choosing a Backend](../guides/choosing-a-backend.md). The frontend is React or Vue — see
[Choosing a Frontend](../guides/choosing-a-frontend.md).

## Usage

```bash
blacksmith init <project-name> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `project-name` | Name of the project directory to create |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--type <type>` | `fullstack` | Project type: `fullstack`, `backend`, or `frontend` |
| `--backend <framework>` | `django` | Backend framework: `django`, `express`, `fastapi`, or `spring` |
| `--frontend <framework>` | `react` | Frontend framework: `react` or `vue` |
| `--backend-port <port>` | `8000` | Port for the backend development server |
| `--frontend-port <port>` | `5173` | Port for the Vite development server |
| `--theme-color <color>` | `default` | UI theme color preset |
| `--ai` | `false` | Generate CLAUDE.md and AI development skill files |
| `--no-ui-skill` | — | With `--ai`, leave out the UI kit skills (Chakra UI or Nuxt UI). `--no-chakra-ui-skill` still works |

### Project Types

| Type | Description |
|------|-------------|
| `fullstack` | Backend + frontend in `backend/` and `frontend/` subdirectories |
| `backend` | API project at the project root (no frontend) |
| `frontend` | React or Vue + Vite project at the project root (no backend) |

### Backend Frameworks

| Framework | Description |
|-----------|-------------|
| `django` | Django + DRF + drf-spectacular + SimpleJWT, with a Python virtual environment |
| `express` | Express 5 + Prisma + Zod + zod-to-openapi, in TypeScript |
| `fastapi` | FastAPI + Pydantic + SQLAlchemy + PyJWT, with a Python virtual environment |
| `spring` | Spring Boot 4.1 + Spring Data JPA + Spring Security (JWT) + Flyway + springdoc-openapi, in Java 17+ with the Gradle wrapper |

All four expose the same HTTP API, so the generated frontend is identical. Omit the
flag and `init` prompts for it. The flag is ignored for `--type frontend`.

### Frontend Frameworks

| Framework | Description |
|-----------|-------------|
| `react` | React 19 + React Router + TanStack React Query + React Hook Form + Chakra UI v3 |
| `vue` | Vue 3.5 + Vue Router + Pinia + TanStack Vue Query + Nuxt UI v4 on Tailwind CSS v4 |

Both build the same pages against the same generated API client, with any backend. Omit the
flag and `init` prompts for it. The flag is ignored for `--type backend`. The choice is
recorded as `frontend.framework` in `blacksmith.config.json`.

### Theme Color Options

| Color | Description |
|-------|-------------|
| `default` | Monochrome (black and white actions), rounded |
| `neutral` | Monochrome, square corners |
| `blue` | Blue accent |
| `green` | Green accent |
| `red` | Red accent |
| `violet` | Violet accent |

See [Theme Colors](/docs/configuration/theme-colors).

## What It Does

The `init` command performs the following steps based on the selected project type:

### All project types
1. **Validates prerequisites** — Checks that required tools are installed (Python 3 for a Django or FastAPI backend, Node.js/npm for an Express backend or any frontend, Java 17 or newer for a Spring Boot backend)
2. **Creates project directory** and `blacksmith.config.json`
3. **Optionally generates AI files** (`CLAUDE.md` and `.claude/skills/`) with skills tailored to the project type

### Backend steps (fullstack and backend)
4. **Scaffolds the backend** —
   - *Django*: split settings, users app, DRF, drf-spectacular, SimpleJWT, environment management
   - *Express*: app and module layout, Prisma schema, JWT auth, Zod validation, OpenAPI registry
   - *FastAPI*: `app/` package (main, config, db, routers), SQLAlchemy models, JWT auth, Pydantic validation, built-in OpenAPI
   - *Spring Boot*: Gradle project with wrapper, `app` package (auth, config, errors, users), JPA `User` entity, Spring Security JWT auth, Bean Validation, Flyway migration, springdoc-openapi; `.env` created from `.env.example`
5. **Creates Python virtual environment** and installs dependencies (Django and FastAPI); for Spring Boot, makes `gradlew` executable and runs `./gradlew classes`, which downloads Gradle and the dependencies on the first run (a few minutes; later runs are fast)
6. **Runs initial database setup** — Django migrations, Prisma migrate for Express, Alembic migrations for FastAPI. Spring Boot has no step here: Flyway applies the migrations when the application starts

### Frontend steps (fullstack and frontend)
7. **Scaffolds the frontend** —
   - *React*: Vite, TypeScript, React Router, TanStack React Query, React Hook Form + Zod, Chakra UI, auth pages
   - *Vue*: Vite, TypeScript (`vue-tsc`), Vue Router, Pinia, TanStack Vue Query, Nuxt UI + Tailwind, Zod, ESLint, auth pages
8. **Installs frontend npm packages**

### Fullstack only
9. **Performs first OpenAPI sync** to generate TypeScript types from the backend's OpenAPI schema

## Examples

```bash
# Interactive (prompts for type, ports, theme, AI support)
blacksmith init my-app

# Fullstack with custom ports
blacksmith init my-app --type fullstack -b 9000 -f 3000 --theme-color blue

# Backend-only Django API
blacksmith init my-api --type backend -b 8000 --ai

# Fullstack with a Spring Boot backend
blacksmith init my-app --type fullstack --backend spring

# Frontend-only React app
blacksmith init my-ui --type frontend -f 3000 --theme-color violet

# Fullstack with a FastAPI backend and a Vue frontend
blacksmith init my-app --backend fastapi --frontend vue
```

## Generated Structure

See [Project Structure](/docs/guides/project-structure) for the complete layout of generated projects for each type.
