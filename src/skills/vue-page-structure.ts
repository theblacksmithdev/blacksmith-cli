import type { Skill, SkillContext } from './types.js'

export const vuePageStructureSkill: Skill = {
  id: 'page-structure',
  name: 'Page & Route Structure',
  description: 'Page folders, feature modules, routing conventions, route guards, and route composition patterns for the Vue frontend.',

  render(_ctx: SkillContext): string {
    return `## Page & Route Structure

> **RULE: Every page and feature owns its own \`routes.ts\`. The central router only composes them — never import page components directly into \`src/router/routes.ts\`.**

### Standalone Pages (\`src/pages/\`)

Each page gets its own folder. Single-file components are PascalCase; everything else is kebab-case:

\`\`\`
pages/<page>/
├── <Name>Page.vue     # Page component (thin orchestrator)
├── routes.ts          # Exports RouteRecordRaw[] for this page
├── index.ts           # Re-exports public members (routes)
├── components/        # Components private to this page (optional)
└── composables/       # Page-local composables (UI logic, not API composables)
\`\`\`

**\`routes.ts\`** — defines the route records using the \`Path\` enum. Pages are lazy-loaded so each one is its own chunk:
\`\`\`ts
import type { RouteRecordRaw } from 'vue-router'
import { Path } from '@/router/paths'

export const settingsRoutes: RouteRecordRaw[] = [
  { path: Path.Settings, component: () => import('./SettingsPage.vue') },
]
\`\`\`

**\`index.ts\`** — re-exports only public members:
\`\`\`ts
export { settingsRoutes } from './routes'
\`\`\`

### Resource Pages (\`blacksmith make:resource\`)

\`blacksmith make:resource BlogPost\` generates this folder, and the matching API composables in \`src/api/composables/blog-posts/\`:

\`\`\`
pages/blog-posts/
├── BlogPostsPage.vue          # List, pagination, "New blog post" modal
├── BlogPostDetailPage.vue     # Detail, edit modal, delete
├── routes.ts                  # List + detail routes
├── schemas.ts                 # Zod schema and form data type
├── index.ts                   # Routes, API composables, components
├── components/
│   ├── BlogPostCard.vue
│   ├── BlogPostList.vue
│   ├── BlogPostForm.vue
│   └── __tests__/
├── composables/               # Page-local composables (UI logic only)
└── __tests__/
\`\`\`

**\`routes.ts\`** — route params reach the page as props with \`props: true\`:
\`\`\`ts
import type { RouteRecordRaw } from 'vue-router'
import { Path } from '@/router/paths'

export const blogPostsRoutes: RouteRecordRaw[] = [
  { path: Path.BlogPosts, component: () => import('./BlogPostsPage.vue') },
  // \`props: true\` passes the \`:id\` param to the page as a prop
  { path: \`\${Path.BlogPosts}/:id\`, component: () => import('./BlogPostDetailPage.vue'), props: true },
]
\`\`\`

\`\`\`vue
<!-- BlogPostDetailPage.vue -->
<script setup lang="ts">
const props = defineProps<{
  /** From the URL, \`BlogPosts/:id\` */
  id: string
}>()

const { data: blogPost, isLoading, errorMessage } = useGetBlogPost(() => props.id)
</script>
\`\`\`

Prefer \`props: true\` over \`useRoute().params\` in pages: the page states what it needs, and its tests pass the id as a prop.

### Feature Modules (\`src/features/\`)

Features with pages, state and components that belong together (auth is the built-in example) live in \`src/features/<feature>/\`:

\`\`\`
features/auth/
├── adapter.ts         # Talks to the backend's auth endpoints (shared with React)
├── types.ts
├── schemas.ts         # Zod schemas for the auth forms
├── stores/
│   └── auth-store.ts  # Pinia store: user, ready, actions
├── composables/
│   └── use-auth.ts    # The one import path for auth in components
├── components/
│   └── AuthPanel.vue
├── pages/
│   ├── LoginPage.vue
│   ├── RegisterPage.vue
│   ├── ForgotPasswordPage.vue
│   └── ResetPasswordPage.vue
├── routes.ts          # RouteRecordRaw[] for all pages in this feature
└── index.ts           # Re-exports routes + public API
\`\`\`

\`\`\`ts
// features/auth/routes.ts
export const authRoutes: RouteRecordRaw[] = [
  { path: Path.Login, component: () => import('./pages/LoginPage.vue') },
  { path: Path.Register, component: () => import('./pages/RegisterPage.vue') },
  { path: Path.ForgotPassword, component: () => import('./pages/ForgotPasswordPage.vue') },
  { path: Path.ResetPassword, component: () => import('./pages/ResetPasswordPage.vue'), props: true },
]
\`\`\`

### Route Paths (\`src/router/paths.ts\`)

All route paths are defined in a central \`Path\` enum — **never use hardcoded path strings**. The file is shared with the React frontend:

\`\`\`ts
export enum Path {
  Home = '/',
  Login = '/login',
  Register = '/register',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password/:token',
  Dashboard = '/dashboard',
  // blacksmith:path
}
\`\`\`

Use \`Path\` everywhere — in route records, \`router.push()\`, \`<RouterLink :to>\`, and \`<UButton :to>\`:
\`\`\`vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import UButton from '@nuxt/ui/components/Button.vue'
import { Path } from '@/router/paths'
import TextLink from '@/shared/components/TextLink.vue'

const router = useRouter()

function goHome() {
  router.push(Path.Home)
}
</script>

<template>
  <UButton :to="Path.Dashboard">Open dashboard</UButton>
  <TextLink :to="Path.Login">Log in</TextLink>
</template>
\`\`\`

For dynamic paths, use the \`buildPath\` helper:
\`\`\`ts
import { Path, buildPath } from '@/router/paths'

buildPath(Path.ResetPassword, { token: 'abc123' })
// => '/reset-password/abc123'
\`\`\`

\`Path\` and \`buildPath\` are also re-exported from \`@/router\`.

Site-wide details (app name, support email, legal "last updated" date) live in \`SITE\` from \`@/shared/utils/site-config\` — read them from there, never hardcode them.

### Central Router (\`src/router/\`)

\`\`\`
router/
├── index.ts               # createRouter, history, scroll behaviour, installs the guard
├── routes.ts              # Composes every page's routes; marker comments
├── guards.ts              # installAuthGuard: requiresAuth → login
├── route-meta.ts          # Types for route meta (requiresAuth)
├── paths.ts               # Path enum + buildPath
├── RouteErrorBoundary.vue # Catches render errors inside a layout
└── layouts/
    ├── MainLayout.vue     # Header, page, footer
    ├── AuthLayout.vue     # Centered auth column
    └── components/        # SiteHeader, UserMenu, FooterLinks
\`\`\`

**\`routes.ts\`** imports and spreads route arrays — it never imports page components directly:

\`\`\`ts
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/router/layouts/MainLayout.vue'
import AuthLayout from '@/router/layouts/AuthLayout.vue'
import { homeRoutes } from '@/pages/home'
import { dashboardRoutes } from '@/pages/dashboard'
import { legalRoutes } from '@/pages/legal'
import { supportRoutes } from '@/pages/support'
import { authRoutes } from '@/features/auth'
import { blogPostsRoutes } from '@/pages/blog-posts'
// blacksmith:import

const publicRoutes: RouteRecordRaw[] = [
  ...homeRoutes,
  ...legalRoutes,   // /terms, /privacy
  ...supportRoutes, // /support
]

const privateRoutes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...blogPostsRoutes,
  // blacksmith:routes
]

export const routes: RouteRecordRaw[] = [
  // App pages — first, so \`/\` is the home page and not an empty auth layout
  {
    path: '/',
    component: MainLayout,
    children: [
      ...publicRoutes,
      { path: '', meta: { requiresAuth: true }, children: privateRoutes },
    ],
  },
  // Auth pages
  { path: '/', component: AuthLayout, children: authRoutes },
  // Catch-all 404
  { path: '/:pathMatch(.*)*', component: () => import('@/shared/components/NotFoundPage.vue') },
]
\`\`\`

Both layouts sit at \`/\`, so **their order matters**: the app layout comes first. \`src/router/__tests__/routes.spec.ts\` pins which layout each path opens — keep it passing when you reorganise routes.

### Private Routes and the Auth Guard

A route is private when it sits under the \`requiresAuth\` group (or any parent with \`meta: { requiresAuth: true }\`). \`installAuthGuard\` in \`router/guards.ts\` sends signed-out visitors to \`Path.Login\` with \`?redirect=<the page they asked for>\`, and the login page returns them there.

The guard **awaits \`useAuthStore().whenReady()\` first**: on a hard refresh of a private page the stored session has not been restored yet, and redirecting then would bounce every reload to the login page. Keep that \`await\` in any guard you add.

New route meta fields are typed in \`router/route-meta.ts\`:
\`\`\`ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}
\`\`\`

### Auto-Registration

\`blacksmith make:resource\` automatically registers routes using marker comments:
- \`// blacksmith:path\` — new \`Path\` enum entry is inserted above this marker in \`paths.ts\`
- \`// blacksmith:import\` — new import line is inserted above this marker in \`routes.ts\`
- \`// blacksmith:routes\` — new spread line is inserted above this marker in \`routes.ts\`

Never remove these markers. They must stay in the \`Path\` enum, the \`privateRoutes\` array, and the import block.

### When to Use Pages vs Features

| Use \`pages/<page>/\` | Use \`features/<feature>/\` |
|---|---|
| Standalone pages (home, dashboard, settings) and generated resources | A capability spanning several pages plus its own store or adapter |
| Composables and components used only there | Composables, components, stores and pages that belong together |
| One or two routes | Several related routes (login, register, reset) |

### Component Decomposition

> **RULE: Pages compose, components render, composables think. Break every page into small, focused child components stored in \`components/\`, one component per file.**

A page reads data (via composables), passes it down as props, and composes child components. It should contain minimal markup itself.

\`\`\`
pages/dashboard/
├── DashboardPage.vue              # Page: composes children, calls composables
├── components/
│   ├── StatsCards.vue             # Renders the stats grid
│   ├── RecentActivity.vue         # Renders activity feed
│   └── QuickActions.vue           # Renders action buttons
├── composables/
│   └── use-dashboard-data.ts      # All data for this page
├── routes.ts
└── index.ts
\`\`\`

\`\`\`vue
<!-- DashboardPage.vue — thin orchestrator -->
<script setup lang="ts">
import USeparator from '@nuxt/ui/components/Separator.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import StatsCards from './components/StatsCards.vue'
import RecentActivity from './components/RecentActivity.vue'
import QuickActions from './components/QuickActions.vue'
import { useDashboardData } from './composables/use-dashboard-data'

const { stats, activity, isLoading } = useDashboardData()
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageHeader title="Dashboard" description="Your workspace at a glance." />
    <StatsCards :stats="stats" :is-loading="isLoading" />
    <USeparator />
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <RecentActivity :items="activity" :is-loading="isLoading" class="lg:col-span-2" />
      <QuickActions />
    </div>
  </div>
</template>
\`\`\`

**When to extract a child component:**
- A section of the template exceeds ~30 lines
- A block has its own loading/error state
- A block is logically independent (a table, a form, a sidebar)
- A block could be reused on another page (move it to \`shared/components/\` or the feature's \`components/\`)

**When NOT to extract:**
- A few lines of simple, static markup (headings, wrappers)
- Extracting would just pass props through another layer with no clarity gain

### Separating Logic into Composables

> **RULE: Components render. Composables think. Never mix data fetching, transformations, or complex state into a component's \`<script setup>\`.**

Extract logic into composables in the \`composables/\` folder co-located with the page or feature:

\`\`\`vue
<!-- BAD — logic mixed into the page -->
<script setup lang="ts">
const page = ref(1)
const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const { data, isLoading } = useApiQuery(() => ({
  ...ordersListOptions({ query: { page: page.value, search: debouncedSearch.value } }),
}))
const deleteOrder = useApiMutation({ ...ordersDestroyMutation(), invalidateKeys: [ordersListQueryKey()] })
// ...plus derived state and handlers, then 200 lines of template
</script>
\`\`\`

\`\`\`ts
// GOOD — composables/use-orders-page.ts
import { ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import { useDeleteOrder, useOrders } from '@/api/composables/orders'

export function useOrdersPage() {
  const page = ref(1)
  const search = ref('')
  const debouncedSearch = refDebounced(search, 300)

  // A getter, so the list refetches when page or search changes
  const { data, isLoading, errorMessage } = useOrders(() => ({
    page: page.value,
    search: debouncedSearch.value,
  }))
  const { mutate: deleteOrder } = useDeleteOrder()

  return { data, isLoading, errorMessage, page, search, deleteOrder }
}
\`\`\`

\`\`\`vue
<!-- OrdersPage.vue -->
<script setup lang="ts">
import PageHeader from '@/shared/components/PageHeader.vue'
import ListPagination from '@/shared/components/ListPagination.vue'
import OrdersToolbar from './components/OrdersToolbar.vue'
import OrdersTable from './components/OrdersTable.vue'
import { useOrdersPage } from './composables/use-orders-page'

const { data, isLoading, page, search, deleteOrder } = useOrdersPage()
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Orders" />
    <OrdersToolbar v-model:search="search" />
    <OrdersTable
      :orders="data?.orders ?? []"
      :is-loading="isLoading"
      @delete="(id) => deleteOrder({ path: { id } })"
    />
    <ListPagination v-model:page="page" :total="data?.total ?? 0" />
  </div>
</template>
\`\`\`

**What goes into a composable:**
- API queries and mutations (through the API composables in \`src/api/composables/\`)
- Derived state (\`computed\`)
- Debouncing, pagination, filtering logic
- Watchers and lifecycle side effects
- Anything beyond a single UI toggle ref

**What stays in the component:**
- Simple UI toggles (\`const open = ref(false)\` for a modal is fine inline)
- Template composition and prop passing
- Event handler wiring (calling \`mutate()\`, \`router.push()\`, etc.)

Destructure a composable's return in \`<script setup>\` (\`const { data, isLoading } = ...\`): top-level refs unwrap in the template, while \`mutation.errorMessage\` on an object would need \`.value\`.

### Key Rules

1. **Every page/feature owns its routes** — the route records live next to the page, not in the central router
2. **Lazy-load pages** — \`component: () => import('./SettingsPage.vue')\` in every page route; layouts are imported eagerly
3. **Use the \`Path\` enum for all route paths** — never hardcode path strings; import \`Path\` from \`@/router/paths\`
4. **Route params are props** — \`props: true\` on the route, \`defineProps<{ id: string }>()\` in the page
5. **Private pages go under the \`requiresAuth\` group** — never check auth inside a page component
6. **\`index.ts\` is the public API** — only export what other modules need (routes, composables, components)
7. **Routes use named exports** — \`export const settingsRoutes\`, never a default export
8. **Private components/composables stay in the page folder** — if only one page uses it, co-locate it there
9. **Never import across page folders** — if something is shared, move it to \`shared/\` or a feature
10. **Keep marker comments intact** — \`// blacksmith:path\`, \`// blacksmith:import\`, and \`// blacksmith:routes\` are required for auto-registration
11. **Pages compose, components render, composables think** — no data fetching, transformations, or complex state in component bodies
`
  },
}
