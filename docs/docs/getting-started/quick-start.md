---
sidebar_position: 2
---

# Quick Start

This guide walks you through creating your first Blacksmith project.

## Create a New Project

```bash
blacksmith init my-app
```

You'll be prompted to choose a project type and configure options. Or pass flags to skip prompts:

```bash
blacksmith init my-app --type fullstack -b 8000 -f 5173 --theme-color blue --ai
```

| Option | Default | Description |
|--------|---------|-------------|
| `--type` | `fullstack` | Project type: `fullstack`, `backend`, or `frontend` |
| `--backend-port` | `8000` | Django development server port |
| `--frontend-port` | `5173` | Vite development server port |
| `--theme-color` | `default` | UI theme preset (`default`, `blue`, `green`, `violet`, `red`, `neutral`) |
| `--ai` | `false` | Generate CLAUDE.md and AI skill files |

## Start the Development Server

```bash
cd my-app
blacksmith dev
```

What starts depends on your project type:

| Type | What runs |
|------|-----------|
| **Fullstack** | Django + Vite + OpenAPI watcher (auto-syncs types on backend changes) |
| **Backend** | Django development server |
| **Frontend** | Vite dev server with hot reloading |

## Create Your First Resource

Let's create a `Product` resource:

```bash
blacksmith make:resource Product
```

What gets generated depends on your project type:

**Backend** (fullstack and backend projects):

| File | Purpose |
|------|---------|
| `apps/products/models.py` | Django model |
| `apps/products/serializers.py` | DRF serializer |
| `apps/products/views.py` | DRF viewset |
| `apps/products/urls.py` | URL routes |
| `apps/products/admin.py` | Admin registration |
| `apps/products/tests.py` | Test scaffold |

**Frontend** (fullstack and frontend projects):

| File | Purpose |
|------|---------|
| `src/api/hooks/products/` | Query and mutation hooks |
| `src/pages/products/` | List and detail pages |

For fullstack projects, it also syncs the OpenAPI schema to generate TypeScript types.

## Customize Your Model

Edit the generated model to add your fields:

```python
# apps/products/models.py (or backend/apps/products/models.py for fullstack)
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
```

For fullstack projects, sync to regenerate frontend types:

```bash
blacksmith sync
```

## Build for Production

```bash
blacksmith build
```

This runs the appropriate build steps for your project type — Vite build for frontend, `collectstatic` for backend, or both for fullstack.

## Next Steps

- [Project Structure](/docs/guides/project-structure) — Understand the generated file layout
- [OpenAPI Sync](/docs/guides/openapi-sync) — Learn how type synchronization works (fullstack)
- [Creating Resources](/docs/guides/creating-resources) — Deep dive into resource scaffolding
- [Authentication](/docs/guides/authentication) — Explore the built-in auth system
