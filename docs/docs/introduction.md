---
sidebar_position: 1
slug: /
---

# Introduction

**Blacksmith CLI** is a development framework that scaffolds production-ready web applications with **Django**, **React**, or both. Choose the project type that fits your needs:

- **Fullstack** — Django backend + React frontend, wired together through automatic OpenAPI synchronization
- **Backend** — Standalone Django REST API
- **Frontend** — Standalone React application with Vite

Blacksmith eliminates the friction of project setup by providing:

- **One-command project setup** — Create a complete project with authentication, routing, and API client pre-configured
- **Automatic type synchronization** — OpenAPI schema keeps Django serializers and TypeScript types in perfect sync (fullstack)
- **Resource scaffolding** — Generate models, serializers, viewsets, pages, hooks, and routes with a single command
- **AI-ready development** — Generate project-aware documentation for AI coding assistants
- **Clean ejection** — Eject anytime to a standard project with no lock-in

## How It Works

### Fullstack Projects

Blacksmith uses **OpenAPI** as the bridge between your Django backend and React frontend. When you define models and serializers in Django, Blacksmith generates:

1. An **OpenAPI 3.0 schema** from your Django REST Framework serializers (via `drf-spectacular`)
2. **TypeScript types** matching your serializers exactly
3. **Zod validation schemas** for runtime validation
4. **API client functions** for calling your endpoints
5. **React Query hooks** for data fetching with caching and state management

This means changing a field in your Django model automatically flows through to your React components — no manual type definitions needed.

### Single-End Projects

Backend-only and frontend-only projects give you the same scaffolding quality without the cross-stack wiring. The generated code lives at the project root (no `backend/` or `frontend/` subdirectory) for a clean, standard structure.

## Quick Example

```bash
# Install Blacksmith CLI
npm install -g blacksmith-cli

# Create a fullstack project
blacksmith init my-app --type fullstack

# Or a backend-only API
blacksmith init my-api --type backend

# Or a frontend-only app
blacksmith init my-ui --type frontend

# Start development
cd my-app
blacksmith dev

# Generate a CRUD resource
blacksmith make:resource BlogPost
```

## Next Steps

- [Installation](/docs/getting-started/installation) — Install Blacksmith CLI and prerequisites
- [Quick Start](/docs/getting-started/quick-start) — Create your first project in 5 minutes
- [CLI Commands](/docs/commands/init) — Explore all available commands
- [Project Structure](/docs/guides/project-structure) — Understand the generated project layout
