---
sidebar_position: 4
---

# blacksmith make:resource

Generate a CRUD resource. The generated files depend on your project type.

## Usage

```bash
blacksmith make:resource <ResourceName>
```

## Arguments

| Argument | Description |
|----------|-------------|
| `ResourceName` | Name of the resource in PascalCase (e.g., `BlogPost`, `Product`) |

## What It Generates

### Backend Files (fullstack and backend projects)

Created in `apps/<resource_name>/` (at project root for backend-only, in `backend/` for fullstack):

| File | Description |
|------|-------------|
| `models.py` | Django model with basic fields |
| `serializers.py` | DRF serializer for the model |
| `views.py` | DRF viewset with CRUD operations |
| `urls.py` | URL router configuration |
| `admin.py` | Django admin site registration |
| `tests.py` | Test scaffold |

### API Hooks (fullstack and frontend projects)

Created in `src/api/hooks/<resource-name>/`:

| File | Description |
|------|-------------|
| `index.ts` | Barrel export for all resource hooks |
| `use-<resources>-query.ts` | List query with pagination, search, and ordering |
| `use-<resource>-mutations.ts` | Create, update, and delete with cache invalidation |

### Frontend Pages (fullstack and frontend projects)

Created in `src/pages/<resource-name>/`:

| File | Description |
|------|-------------|
| List page | Paginated list of resources |
| Detail page | Single resource view |
| Card component | Resource card for list views |

### Automatic Integration

The command also performs these steps (where applicable to the project type):

| Step | Fullstack | Backend | Frontend |
|------|-----------|---------|----------|
| Register Django app in settings | Yes | Yes | — |
| Add API URLs to `config/urls.py` | Yes | Yes | — |
| Run `makemigrations` + `migrate` | Yes | Yes | — |
| Sync OpenAPI schema | Yes | — | — |
| Register frontend routes | Yes | — | Yes |
| Add path to `Path` enum | Yes | — | Yes |

## Name Conventions

Blacksmith automatically handles name casing across all generated files:

| Input | Usage | Example |
|-------|-------|---------|
| `BlogPost` | PascalCase (model, component names) | `class BlogPost` |
| `blogPost` | camelCase (variables, hooks) | `const blogPost = ...` |
| `blog_posts` | snake_case (Django app, URLs) | `apps/blog_posts/` |
| `blog-posts` | kebab-case (route paths, directories) | `/blog-posts` |

## Examples

```bash
blacksmith make:resource Product
blacksmith make:resource BlogPost
blacksmith make:resource UserProfile
```

## After Generation

After the resource is generated, you'll typically want to:

1. **Customize the model** — Add your specific fields
2. **Update the serializer** — Match the new model fields
3. **Run migrations** — `blacksmith backend makemigrations && blacksmith backend migrate`
4. **Sync types** (fullstack) — `blacksmith sync` (or let `blacksmith dev` handle it)
5. **Customize the frontend** — Update the generated pages and forms

See [Creating Resources Guide](/docs/guides/creating-resources) for a detailed walkthrough.
