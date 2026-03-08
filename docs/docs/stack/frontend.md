---
sidebar_position: 2
---

# Frontend Stack

Blacksmith's frontend is a modern React application built with TypeScript and Vite, using best-in-class libraries for routing, data fetching, forms, and styling.

## Core Technologies

### React 19

The UI library. Blacksmith generates functional components using hooks and modern patterns.

### TypeScript (Strict Mode)

Full type safety with strict TypeScript configuration. Types for API responses are auto-generated from the OpenAPI schema.

### Vite

Fast build tooling with:

- Instant dev server startup
- Hot Module Replacement (HMR)
- Optimized production builds
- Path aliases (`@/` maps to `src/`)

### React Router v7

Client-side routing with:

- File-based route organization
- Authentication guards (protected and guest routes)
- Route path enum for type-safe navigation

### TanStack React Query

Server state management:

- Automatic caching and background refetching
- Optimistic updates
- Loading and error states
- Auto-generated hooks from OpenAPI schema

### React Hook Form + Zod

Form handling:

- **React Hook Form** for performant form state management
- **Zod** for schema validation (schemas auto-generated from OpenAPI)
- **@hookform/resolvers** for integrating Zod with React Hook Form

### Tailwind CSS

Utility-first CSS framework:

- Theme color customization via presets
- Responsive design utilities
- No custom CSS needed for most components

### @hey-api/openapi-ts

Generates TypeScript client code from the OpenAPI schema:

- Type definitions
- Zod schemas
- API client SDK
- React Query hooks

## Project Layout

```
frontend/
├── src/
│   ├── api/
│   │   └── generated/          # Auto-generated (don't edit)
│   │       ├── types.gen.ts
│   │       ├── zod.gen.ts
│   │       ├── sdk.gen.ts
│   │       └── @tanstack/
│   │           └── react-query.gen.ts
│   ├── features/
│   │   └── auth/               # Authentication module
│   ├── pages/                  # Route pages
│   ├── router/                 # Routing config
│   ├── shared/                 # Shared components, hooks, utils
│   ├── styles/                 # Global styles
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
├── openapi-ts.config.ts        # Code generation config
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Key Patterns

### Data Fetching

Use the auto-generated React Query hooks:

```typescript
import { useProductsList } from '@/api/generated/@tanstack/react-query.gen';

function ProductList() {
  const { data, isLoading, error } = useProductsList();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return data.map(product => <ProductCard key={product.id} product={product} />);
}
```

### Mutations

```typescript
import { useProductsCreate } from '@/api/generated/@tanstack/react-query.gen';

function CreateProduct() {
  const mutation = useProductsCreate();

  const onSubmit = (data: ProductCreate) => {
    mutation.mutate({ body: data });
  };

  return <ProductForm onSubmit={onSubmit} isLoading={mutation.isPending} />;
}
```

### Form Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductSchema } from '@/api/generated/zod.gen';

function ProductForm() {
  const form = useForm({
    resolver: zodResolver(ProductSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
    </form>
  );
}
```

### Navigation

```typescript
import { useNavigate } from 'react-router-dom';
import { Paths } from '@/router/paths';

function MyComponent() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(Paths.PRODUCTS)}>
      View Products
    </button>
  );
}
```

## Dependencies

Key packages in `package.json`:

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI library |
| `react-router-dom` | Client-side routing |
| `@tanstack/react-query` | Server state management |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `@hookform/resolvers` | Form + Zod integration |
| `tailwindcss` | Utility-first CSS |
| `@hey-api/openapi-ts` | API client code generation |
| `axios` | HTTP client |
