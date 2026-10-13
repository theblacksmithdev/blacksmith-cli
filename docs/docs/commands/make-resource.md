---
sidebar_position: 4
---

# blacksmith make:resource

:::note Express backends
On an Express project the backend half of the command creates
`src/modules/<name>/` (schemas, service, controller, routes, tests), appends the model to
`prisma/schema.prisma` along with the `User` back-relation it needs, mounts the router in
`src/modules/index.ts`, and runs `prisma migrate dev`. The frontend half is identical.
:::

:::note FastAPI backends
On a FastAPI project the backend half creates an `app/<name>/` package (`models.py`,
`schemas.py`, `service.py`, `router.py`) and `tests/test_<name>.py`, mounts the router in
`app/main.py`, and writes and applies an Alembic migration
(`alembic revision --autogenerate`, then `alembic upgrade head`). The frontend half is
identical. Projects created before resource support have no Alembic setup; the command
stops before writing anything and says so.
:::

:::note Spring Boot backends
On a Spring Boot project the backend half creates a package under
`src/main/java/app/` named after the plural with the words run together (`BlogPost` →
`app.blogposts`): the entity, repository, service and controller, and in `dto/` the
response, request, PATCH and page records. It adds `src/test/java/app/<package>/` with a
JUnit API test, writes the next Flyway migration (`V<n>__create_blog_posts.sql`, one past
the highest version present), and compiles the backend. Spring finds the controller by
component scanning, so nothing is registered, and Flyway applies the migration when the
application starts. The frontend half is identical.
:::


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
| `tests.py` | pytest suite: CRUD, ownership boundaries, and model behaviour (15 tests) |

### Frontend Files (fullstack and frontend projects)

The frontend half depends on the project's frontend framework. Both give the same result:
a paginated list page with a **New** dialog, a detail page with **Edit** (in a dialog) and
**Delete**, query and mutation code with cache invalidation, and tests. Cards and lists are
typed with the resource's generated type, and the UI text uses readable labels
("New blog post", "No blog posts yet").

#### React

| Path | Description |
|------|-------------|
| `src/api/hooks/<resource-name>/index.ts` | Barrel export for the resource hooks |
| `src/api/hooks/<resource-name>/use-<resources>-query.ts` | List query (pagination, search, ordering) and detail query |
| `src/api/hooks/<resource-name>/use-<resource>-mutations.ts` | Create, update, and delete with cache invalidation |
| `src/pages/<resource-name>/<resources>-page.tsx` | List page with pagination and the create dialog |
| `src/pages/<resource-name>/<resource>-detail-page.tsx` | Detail page with edit and delete |
| `src/pages/<resource-name>/schemas.ts` | The form's Zod schema and its data type |
| `src/pages/<resource-name>/components/` | Card, list, form, and form dialog |
| `src/pages/<resource-name>/__tests__/`, `components/__tests__/` | Vitest specs for the list page, list and card |

#### Vue

| Path | Description |
|------|-------------|
| `src/api/composables/<resource-name>/index.ts` | Barrel export for the resource composables |
| `src/api/composables/<resource-name>/use-<resources>-query.ts` | List and detail queries; the list takes its params as a getter, so it refetches when the page changes |
| `src/api/composables/<resource-name>/use-<resource>-mutations.ts` | Create, update, and delete with cache invalidation |
| `src/api/composables/<resource-name>/__tests__/` | A spec that pages to page 2 and checks the list refetches |
| `src/pages/<resource-name>/<Resources>Page.vue` | List page with pagination and the create dialog |
| `src/pages/<resource-name>/<Resource>DetailPage.vue` | Detail page with edit and delete; the id arrives as a prop |
| `src/pages/<resource-name>/schemas.ts` | The form's Zod schema and its data type |
| `src/pages/<resource-name>/components/` | `<Resource>Card.vue`, `<Resource>List.vue`, `<Resource>Form.vue` |
| `src/pages/<resource-name>/composables/` | Page-local composables (empty to start) |
| `src/pages/<resource-name>/__tests__/`, `components/__tests__/` | Vitest specs for the list page, list and card |

Generated tests pass immediately — run them with
[`blacksmith test`](./test.md). See the [Testing guide](../guides/testing.md)
for the conventions they follow.

### Automatic Integration

The command also performs these steps (where applicable to the project type):

| Step | Fullstack | Backend | Frontend |
|------|-----------|---------|----------|
| Register Django app in settings | Yes | Yes | — |
| Add API URLs to `config/urls.py` | Yes | Yes | — |
| Run `makemigrations` + `migrate` | Yes | Yes | — |
| Sync OpenAPI schema | Yes | — | — |
| Register frontend routes (`routes.tsx` for React, `routes.ts` for Vue) | Yes | — | Yes |
| Add path to `Path` enum | Yes | — | Yes |

## Name Conventions

Blacksmith automatically handles name casing across all generated files:

| Input | Usage | Example |
|-------|-------|---------|
| `BlogPost` | PascalCase (model, component names) | `class BlogPost` |
| `blogPost` | camelCase (variables, hooks, composables) | `const blogPost = ...` |
| `blog_posts` | snake_case (Django app, URLs) | `apps/blog_posts/` |
| `blog-posts` | kebab-case (route paths, directories) | `/blog-posts` |
| `blog post` | Words (UI text) | `New blog post` |

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
