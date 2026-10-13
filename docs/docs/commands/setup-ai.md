---
sidebar_position: 7
---

# blacksmith setup:ai

Generate AI development documentation for AI coding assistants.

## Usage

```bash
blacksmith setup:ai [--no-ui-skill]
```

| Option | Description |
|--------|-------------|
| `--no-ui-skill` | Leave out the UI kit skills (Chakra UI for React, Nuxt UI for Vue). The older `--no-chakra-ui-skill` still works |

## What It Does

Generates comprehensive project-aware documentation that AI coding assistants (like Claude) can use to understand your project:

### CLAUDE.md

A top-level markdown file in the project root containing:

- Project overview and architecture
- Development guidelines and conventions
- Key commands and workflows
- Inline skill documentation

### .claude/skills/

A directory of detailed skill files organized by topic:

| Skill | Description |
|-------|-------------|
| Core Rules | Fundamental project rules and conventions |
| Project Overview | Architecture and directory structure |
| Backend skills | One set for the project's backend framework (below) |
| Frontend skills | One set for the project's frontend framework (below) |
| UI Design | Design system and styling guidelines, in the frontend's UI kit |
| Programming Paradigms | Code style and architectural patterns |
| Clean Code | Code quality guidelines |
| AI Guidelines | How AI assistants should interact with the codebase |

Backend skills are written only for the framework the project uses. Conventions for
the wrong framework are worse than none, so a project never gets another backend's set:

| Framework | Skills |
|-----------|--------|
| Django | `django`, `django-rest-advanced`, `api-documentation`, `backend-modularization` |
| Express | `express`, `express-prisma`, `express-openapi` |
| FastAPI | `fastapi`, `fastapi-sqlalchemy` (models and Alembic migrations) |
| Spring Boot | `spring`, `spring-jpa` (entities and Flyway migrations) |

Frontend skills work the same way. Skills with the same id (`page-structure`,
`frontend-modularization`, `frontend-testing`, `ui-design`) are written for the project's
framework:

| Framework | Skills | UI kit skills (`--no-ui-skill` leaves these out) |
|-----------|--------|---------------------------------------------------|
| React | `react`, `react-query`, `page-structure`, `frontend-modularization`, `frontend-testing` | `chakra-ui-react`, `chakra-ui-forms`, `chakra-ui-auth`, `blacksmith-hooks`, `ui-design` |
| Vue | `vue`, `vue-query`, `page-structure`, `frontend-modularization`, `frontend-testing` | `nuxt-ui`, `nuxt-ui-forms`, `vue-auth`, `blacksmith-composables`, `ui-design` |

The project overview, core rules, CLI, guidelines, clean-code and programming-paradigms
skills describe the project's own backend and frontend too.

## When to Use

- Run after `blacksmith init` if you didn't use the `--ai` flag
- Run to regenerate AI files after major project changes
- Run when onboarding AI assistants to your project

## Using with AI Assistants

Once generated, AI coding assistants will automatically read `CLAUDE.md` to understand your project context. The skill files provide deep knowledge about specific areas when the AI needs detailed guidance.

```bash
# Generate during project creation
blacksmith init my-app --ai

# Or generate later
cd my-app
blacksmith setup:ai
```
