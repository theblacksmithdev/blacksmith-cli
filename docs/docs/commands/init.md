---
sidebar_position: 1
---

# blacksmith init

Scaffold a new fullstack Django + React project.

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
| `--backend-port <port>` | `8000` | Port for the Django development server |
| `--frontend-port <port>` | `5173` | Port for the Vite development server |
| `--theme-color <color>` | `default` | UI theme color preset |
| `--ai` | `false` | Generate CLAUDE.md and AI development skill files |

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

The `init` command performs the following steps:

1. **Validates prerequisites** — Checks that Node.js (>= 20.5.0), Python 3, npm, and pip are installed
2. **Creates project directory** — Sets up the root project folder
3. **Scaffolds backend** — Generates Django project with:
   - Split settings (base, development, production)
   - Users app with custom user model
   - Django REST Framework configuration
   - drf-spectacular for OpenAPI schema
   - SimpleJWT authentication
   - Environment variable management
4. **Scaffolds frontend** — Generates React project with:
   - Vite build tooling
   - TypeScript (strict mode)
   - React Router with auth guards
   - TanStack React Query
   - React Hook Form + Zod
   - Tailwind CSS
   - Authentication pages (login, register, password reset)
5. **Creates Python virtual environment** and installs backend dependencies
6. **Installs frontend npm packages**
7. **Runs initial database migrations**
8. **Performs first OpenAPI sync** to generate TypeScript types
9. **Creates `blacksmith.config.json`** with project metadata
10. **Optionally generates AI files** (`CLAUDE.md` and `.claude/skills/`)

## Examples

```bash
# Basic project
blacksmith init my-app

# Custom ports and theme
blacksmith init my-app --backend-port 9000 --frontend-port 3000 --theme-color blue

# With AI development files
blacksmith init my-app --ai
```

## Generated Structure

See [Project Structure](/docs/guides/project-structure) for the complete layout of a generated project.
