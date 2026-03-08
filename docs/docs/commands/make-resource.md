---
sidebar_position: 4
---

# blacksmith make:resource

Generate a complete CRUD resource across both Django backend and React frontend.

## Usage

```bash
blacksmith make:resource <ResourceName>
```

## Arguments

| Argument | Description |
|----------|-------------|
| `ResourceName` | Name of the resource in PascalCase (e.g., `BlogPost`, `Product`) |

## What It Generates

### Backend Files

Created in `backend/apps/<resource_name>/`:

| File | Description |
|------|-------------|
| `models.py` | Django model with basic fields |
| `serializers.py` | DRF serializer for the model |
| `views.py` | DRF viewset with CRUD operations |
| `urls.py` | URL router configuration |
| `admin.py` | Django admin site registration |
| `tests.py` | Test scaffold |
| `apps.py` | Django app configuration |
| `__init__.py` | Python package init |

### Frontend Files

Created in `frontend/src/pages/<resource_name>/`:

| File | Description |
|------|-------------|
| List page | Paginated list of resources |
| Detail page | Single resource view |
| Create form | Form for creating new resources |
| Edit form | Form for editing existing resources |
| Card component | Resource card for list views |

### Automatic Integration

The command also:

1. **Registers the Django app** in `config/settings/base.py`
2. **Adds API URLs** to `config/urls.py`
3. **Creates database migrations** via `manage.py makemigrations`
4. **Runs migrations** via `manage.py migrate`
5. **Syncs the OpenAPI schema** to generate new TypeScript types and hooks
6. **Registers frontend routes** in React Router
7. **Adds the route path** to the paths enum

## Name Conventions

Blacksmith automatically handles name casing across all generated files:

| Input | Usage | Example |
|-------|-------|---------|
| `BlogPost` | PascalCase (model, component names) | `class BlogPost` |
| `blogPost` | camelCase (variables, hooks) | `const blogPost = ...` |
| `blog_post` | snake_case (Django app, URLs) | `apps/blog_post/` |
| `blog-post` | kebab-case (route paths) | `/blog-posts` |
| `blog posts` | Plural display name | `"Blog Posts"` |

## Examples

```bash
# Create a Product resource
blacksmith make:resource Product

# Create a BlogPost resource
blacksmith make:resource BlogPost

# Create a UserProfile resource
blacksmith make:resource UserProfile
```

## After Generation

After the resource is generated, you'll typically want to:

1. **Customize the model** — Add your specific fields
2. **Update the serializer** — Match the new model fields
3. **Run migrations** — `blacksmith backend makemigrations && blacksmith backend migrate`
4. **Sync types** — `blacksmith sync` (or let `blacksmith dev` handle it)
5. **Customize the frontend** — Update the generated pages and forms

See [Creating Resources Guide](/docs/guides/creating-resources) for a detailed walkthrough.
