---
sidebar_position: 2
---

# Quick Start

This guide walks you through creating your first Blacksmith project.

## Create a New Project

```bash
blacksmith init my-app
```

This will:
1. Create the project directory structure
2. Set up a Django backend with authentication
3. Set up a React frontend with Vite and TanStack Query
4. Create a Python virtual environment and install dependencies
5. Install frontend npm packages
6. Run initial database migrations
7. Perform the first OpenAPI sync

### Customize Your Project

You can pass options during initialization:

```bash
blacksmith init my-app \
  --backend-port 8000 \
  --frontend-port 3000 \
  --theme-color blue \
  --ai
```

| Option | Default | Description |
|--------|---------|-------------|
| `--backend-port` | `8000` | Django development server port |
| `--frontend-port` | `5173` | Vite development server port |
| `--theme-color` | `default` | UI theme preset (`default`, `blue`, `green`, `violet`, `red`, `neutral`) |
| `--ai` | `false` | Generate CLAUDE.md and AI skill files |

## Start the Development Server

```bash
cd my-app
blacksmith dev
```

This starts three processes concurrently:

- **Django** at `http://localhost:8000` — Your API backend
- **React** at `http://localhost:5173` — Your frontend with hot reloading
- **OpenAPI Watcher** — Watches for Python file changes and auto-syncs types

Open `http://localhost:5173` in your browser to see your application.

## Create Your First Resource

Let's create a `Product` resource with full CRUD operations:

```bash
blacksmith make:resource Product
```

This generates everything you need across both stacks:

### Backend (Django)

| File | Purpose |
|------|---------|
| `backend/apps/products/models.py` | Django model |
| `backend/apps/products/serializers.py` | DRF serializer |
| `backend/apps/products/views.py` | DRF viewset |
| `backend/apps/products/urls.py` | URL routes |
| `backend/apps/products/admin.py` | Admin registration |
| `backend/apps/products/tests.py` | Test scaffold |

### Frontend (React)

| File | Purpose |
|------|---------|
| `frontend/src/pages/products/` | List and detail pages |
| `frontend/src/pages/products/` | Create and edit forms |

It also:
- Registers the app in Django settings
- Adds API URLs to the URL configuration
- Creates and runs database migrations
- Syncs the OpenAPI schema to generate TypeScript types
- Registers routes in React Router

## Customize Your Model

Edit the generated model to add your fields:

```python
# backend/apps/products/models.py
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

Update the serializer:

```python
# backend/apps/products/serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
```

Then sync to regenerate frontend types:

```bash
blacksmith sync
```

Your React components now have full type safety for the updated `Product` model.

## Build for Production

When you're ready to deploy:

```bash
blacksmith build
```

This builds the React frontend and collects Django static files, producing a deployment-ready application.

## Next Steps

- [Project Structure](/docs/guides/project-structure) — Understand the generated file layout
- [OpenAPI Sync](/docs/guides/openapi-sync) — Learn how type synchronization works
- [Creating Resources](/docs/guides/creating-resources) — Deep dive into resource scaffolding
- [Authentication](/docs/guides/authentication) — Explore the built-in auth system
