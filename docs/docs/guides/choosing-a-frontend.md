---
sidebar_position: 3
---

# Choosing a Frontend

Blacksmith generates one of two frontends: **React** or **Vue**. Both build the same pages, talk to the same API through the same generated client, and work with every backend. You are choosing a framework and a component library, not a different app.

```bash
blacksmith init my-app --frontend react    # default
blacksmith init my-app --frontend vue
```

Omit the flag and `init` asks. A backend-only project has no frontend and ignores the flag.

## At a Glance

| | React | Vue |
|---|---|---|
| Framework | React 19 | Vue 3.5, `<script setup>` |
| Components | Chakra UI v3 | Nuxt UI v4 on Tailwind CSS v4 |
| Styling | Chakra style props, no utility CSS | Tailwind classes, Nuxt UI semantic colors |
| Routing | React Router 7 | Vue Router 4, with route guards |
| Server state | TanStack React Query | TanStack Vue Query |
| Client state | React context | Pinia |
| Forms | React Hook Form + Zod | `UForm` + Zod |
| Logic | Hooks (`hooks/`) | Composables (`composables/`) |
| Type-check | `tsc -b` | `vue-tsc -b` |
| Tests | Vitest + `@testing-library/react` | Vitest + `@testing-library/vue` |
| Lint | — | ESLint with `eslint-plugin-vue` |
| Stack page | [React](/docs/stack/frontend) | [Vue](/docs/stack/frontend-vue) |

## Pick React If

- Your team writes React, or the app will share components with other React code
- You want the largest ecosystem of libraries, examples and hires
- You prefer styling with component props over utility classes

## Pick Vue If

- Your team writes Vue, or prefers templates to JSX
- You want reactivity that tracks dependencies for you, with no dependency arrays to maintain
- You like Tailwind: the Vue frontend styles layout with utility classes and keeps Nuxt UI for the controls
- You want a lint setup from the start: the Vue project ships ESLint configured

## What Is Identical

- Every page and URL: home, log in, register, password reset, dashboard, terms, privacy, support, and the 404 page
- The auth flow: token storage, restoring the session on reload, refreshing an expired token, and signing out when that fails
- The API client and its configuration, and the parsing of the backend's error responses
- The six [theme presets](/docs/configuration/theme-colors), and light and dark mode
- What `make:resource` builds: a paginated list page with a create dialog, a detail page with edit and delete, query and mutation code with cache invalidation, and tests
- `blacksmith dev`, `sync`, `test`, `build` and `frontend` behave the same; both frontends run on Node with Vite

The files with no framework code in them are the same files in both: the API client, the auth adapter, the `Path` enum, the shared utils, and the page content.

## What Differs Day to Day

| Task | React | Vue |
|------|-------|-----|
| Add a resource | `blacksmith make:resource Post` | same command |
| Where its API code goes | `src/api/hooks/posts/` | `src/api/composables/posts/` |
| Where its page goes | `src/pages/posts/posts-page.tsx` | `src/pages/posts/PostsPage.vue` |
| Register a route | `src/router/routes.tsx` | `src/router/routes.ts` |
| Protect a route | Add it to the private routes | Add it to the private routes (they carry `meta.requiresAuth`) |
| Use a component | `import { Button } from '@chakra-ui/react'` | `import UButton from '@nuxt/ui/components/Button.vue'` |
| Change the look | `src/theme/` tokens and recipes | `src/theme/main.css` and `ui-config.ts` |
| AI skills | `react`, `react-query`, `chakra-ui-*` | `vue`, `vue-query`, `nuxt-ui`, `nuxt-ui-forms`, `vue-auth` |

## Switching Later

There is no automated migration. The backend, the API contract and the generated types carry over unchanged, but every component, page and test is a rewrite. Generating a new project with the other frontend and moving your pages across is usually the quickest route.

## Existing Projects

Projects generated before Vue support have no `frontend.framework` field in `blacksmith.config.json`. That absence reads as `react`, so they keep working untouched. New projects record the framework, so the CLI always knows which templates `make:resource` and `setup:ai` should use.
