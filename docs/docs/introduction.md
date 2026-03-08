---
sidebar_position: 1
slug: /
---

# Introduction

**Blacksmith CLI** is a fullstack development framework that scaffolds production-ready web applications combining **Django** (backend) and **React** (frontend). It eliminates the friction of setting up and maintaining a fullstack project by providing:

- **One-command project setup** — Create a complete Django + React project with authentication, routing, and API client pre-configured
- **Automatic type synchronization** — OpenAPI schema keeps Django serializers and TypeScript types in perfect sync
- **Full-stack resource scaffolding** — Generate models, serializers, viewsets, pages, hooks, and routes across both stacks with a single command
- **AI-ready development** — Generate project-aware documentation for AI coding assistants
- **Clean ejection** — Eject anytime to a standard Django + React project with no lock-in

## How It Works

Blacksmith uses **OpenAPI** as the bridge between your Django backend and React frontend. When you define models and serializers in Django, Blacksmith generates:

1. An **OpenAPI 3.0 schema** from your Django REST Framework serializers (via `drf-spectacular`)
2. **TypeScript types** matching your serializers exactly
3. **Zod validation schemas** for runtime validation
4. **API client functions** for calling your endpoints
5. **React Query hooks** for data fetching with caching and state management

This means changing a field in your Django model automatically flows through to your React components — no manual type definitions needed.

## Quick Example

```bash
# Install Blacksmith CLI
npm install -g blacksmith-cli

# Create a new project
blacksmith init my-app

# Start development (Django + React + auto-sync)
cd my-app
blacksmith dev

# Generate a complete CRUD resource
blacksmith make:resource BlogPost
```

After running `make:resource BlogPost`, you get:

**Backend** — Django model, serializer, viewset, URL routes, admin registration, and migrations

**Frontend** — List page, detail page, create/edit forms, React Query hooks, and route registration

All automatically wired together with type-safe API calls.

## Next Steps

- [Installation](/docs/getting-started/installation) — Install Blacksmith CLI and prerequisites
- [Quick Start](/docs/getting-started/quick-start) — Create your first project in 5 minutes
- [CLI Commands](/docs/commands/init) — Explore all available commands
- [Project Structure](/docs/guides/project-structure) — Understand the generated project layout
