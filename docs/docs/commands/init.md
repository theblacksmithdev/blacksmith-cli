---
sidebar_position: 1
---

# blacksmith init

Scaffold a new Django, React, or fullstack Django + React project.

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
| `--backend-port <port>` | `8000` | Port for the Django development server |
| `--frontend-port <port>` | `5173` | Port for the Vite development server |
| `--theme-color <color>` | `default` | UI theme color preset |
| `--ai` | `false` | Generate CLAUDE.md and AI development skill files |

### Project Types

| Type | Description |
|------|-------------|
| `fullstack` | Django backend + React frontend in `backend/` and `frontend/` subdirectories |
| `backend` | Django API project at the project root (no frontend) |
| `frontend` | React + Vite project at the project root (no backend) |

### Theme Color Options

| Color | Description |
|-------|-------------|
| `default` | Orange/amber tones |
| `blue` | Blue palette |
| `green` | Green palette |
| `violet` | Purple/violet palette |
| `red` | Red palette |
| `neutral` | Gray/neutral palette |

## What It Does

The `init` command performs the following steps based on the selected project type:

### All project types
1. **Validates prerequisites** — Checks that required tools are installed (Python 3 for backend, Node.js/npm for frontend)
2. **Creates project directory** and `blacksmith.config.json`
3. **Optionally generates AI files** (`CLAUDE.md` and `.claude/skills/`) with skills tailored to the project type

### Backend steps (fullstack and backend)
4. **Scaffolds Django project** — Split settings, users app, DRF, drf-spectacular, SimpleJWT, environment management
5. **Creates Python virtual environment** and installs dependencies
6. **Runs initial database migrations**

### Frontend steps (fullstack and frontend)
7. **Scaffolds React project** — Vite, TypeScript, React Router, TanStack React Query, React Hook Form + Zod, Chakra UI, auth pages
8. **Installs frontend npm packages**

### Fullstack only
9. **Performs first OpenAPI sync** to generate TypeScript types from the Django schema

## Examples

```bash
# Interactive (prompts for type, ports, theme, AI support)
blacksmith init my-app

# Fullstack with custom ports
blacksmith init my-app --type fullstack -b 9000 -f 3000 --theme-color blue

# Backend-only Django API
blacksmith init my-api --type backend -b 8000 --ai

# Frontend-only React app
blacksmith init my-ui --type frontend -f 3000 --theme-color violet
```

## Generated Structure

See [Project Structure](/docs/guides/project-structure) for the complete layout of generated projects for each type.
