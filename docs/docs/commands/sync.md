---
sidebar_position: 3
---

# blacksmith sync

Synchronize the OpenAPI schema between Django backend and React frontend.

## Usage

```bash
blacksmith sync
```

## What It Does

The `sync` command performs a two-step process:

### Step 1: Generate OpenAPI Schema

Uses Django's `drf-spectacular` to generate an OpenAPI 3.0 schema from your Django REST Framework serializers and viewsets.

### Step 2: Generate Frontend Code

Uses `@hey-api/openapi-ts` to generate four types of files from the OpenAPI schema:

| Generated File | Purpose |
|----------------|---------|
| `types.gen.ts` | TypeScript interfaces matching your Django serializers |
| `zod.gen.ts` | Zod validation schemas for runtime type checking |
| `sdk.gen.ts` | API client functions for calling your endpoints |
| `@tanstack/react-query.gen.ts` | React Query hooks for data fetching |

All generated files are placed in `frontend/src/api/generated/`.

## When to Use

The sync happens automatically during `blacksmith dev` whenever Python files change. You need to run `sync` manually when:

- You've made backend changes outside of `blacksmith dev`
- The auto-sync encountered an error and you need to retry
- You want to verify the generated types are up to date

## Example Workflow

```bash
# 1. Add a new field to your Django model
# 2. Update the serializer
# 3. Create migrations
blacksmith backend makemigrations
blacksmith backend migrate

# 4. Sync to update frontend types
blacksmith sync

# 5. Your React components now have the new field available
```

## Generated Output

After running sync, you can import the generated code in your React components:

```typescript
// Import generated types
import type { Product } from '@/api/generated/types.gen';

// Import React Query hooks
import { useProductList, useProductCreate } from '@/api/generated/@tanstack/react-query.gen';

// Import Zod schemas for form validation
import { ProductSchema } from '@/api/generated/zod.gen';
```
