---
sidebar_position: 2
---

# OpenAPI Synchronization

OpenAPI is the bridge between your Django backend and React frontend. Blacksmith uses it to automatically generate type-safe client code from your backend API definitions.

## How It Works

```
Django Serializers → OpenAPI Schema → TypeScript Types + API Client + React Query Hooks
```

### 1. Schema Generation

When you run `blacksmith sync` (or it runs automatically during `blacksmith dev`), Blacksmith uses `drf-spectacular` to introspect your Django REST Framework serializers and viewsets and generate an OpenAPI 3.0 schema.

### 2. Code Generation

The OpenAPI schema is then fed to `@hey-api/openapi-ts`, which generates four categories of code:

| File | What It Contains |
|------|-----------------|
| `types.gen.ts` | TypeScript interfaces for every serializer |
| `zod.gen.ts` | Zod schemas for runtime validation |
| `sdk.gen.ts` | Typed API client functions |
| `@tanstack/react-query.gen.ts` | React Query hooks for every endpoint |

### 3. Frontend Usage

Your React components import from the generated files:

```typescript
// Types
import type { Product, ProductCreate } from '@/api/generated/types.gen';

// React Query hooks
import {
  useProductsList,
  useProductsCreate,
  useProductsRetrieve,
  useProductsUpdate,
  useProductsDestroy,
} from '@/api/generated/@tanstack/react-query.gen';

// Zod schemas (for form validation)
import { ProductSchema } from '@/api/generated/zod.gen';
```

## Automatic Sync During Development

When running `blacksmith dev`, a file watcher monitors all `.py` files in the `backend/` directory. Any change triggers an automatic sync cycle:

1. Detect Python file change
2. Wait briefly for saves to settle
3. Generate OpenAPI schema
4. Generate TypeScript code
5. Vite picks up the changed files via HMR

This creates a seamless workflow where backend changes are immediately reflected in frontend types.

## Manual Sync

Run the sync manually when needed:

```bash
blacksmith sync
```

Common scenarios for manual sync:
- After pulling backend changes from git
- After fixing a sync error
- After modifying `openapi-ts.config.ts`

## The Generated API Client

The generated SDK provides typed functions for every API endpoint:

```typescript
// GET /api/products/
const { data } = useProductsList();

// GET /api/products/:id/
const { data } = useProductsRetrieve({ path: { id: 1 } });

// POST /api/products/
const mutation = useProductsCreate();
mutation.mutate({ body: { name: 'Widget', price: 9.99 } });

// PUT /api/products/:id/
const mutation = useProductsUpdate();
mutation.mutate({ path: { id: 1 }, body: { name: 'Updated Widget' } });

// DELETE /api/products/:id/
const mutation = useProductsDestroy();
mutation.mutate({ path: { id: 1 } });
```

## Configuration

The code generation is configured in `frontend/openapi-ts.config.ts`. This file specifies:

- Input schema source (the Django-generated OpenAPI file)
- Output directory (`src/api/generated/`)
- Plugins to use (TypeScript types, Zod, SDK, React Query)

## Troubleshooting

### Sync Fails with Schema Errors

If the OpenAPI schema generation fails, it's usually due to a Django configuration issue:

```bash
# Test schema generation directly
blacksmith backend spectacular --validate
```

### Types Don't Match Expected Shape

Ensure your serializer's `Meta.fields` list includes all the fields you expect:

```python
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'created_at']  # Be explicit
```

### Generated Files Show Stale Data

Try clearing the generated directory and re-syncing:

```bash
rm -rf frontend/src/api/generated/*
blacksmith sync
```
