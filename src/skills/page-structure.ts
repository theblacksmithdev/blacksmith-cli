import type { Skill, SkillContext } from './types.js'

export const pageStructureSkill: Skill = {
  id: 'page-structure',
  name: 'Page & Route Structure',
  description: 'Page folders, feature modules, routing conventions, and route composition patterns.',

  render(_ctx: SkillContext): string {
    return `## Page & Route Structure

> **RULE: Every page and feature owns its own \`routes.tsx\`. The central router only composes them — never import page components directly into \`routes.tsx\`.**

### Standalone Pages (\`src/pages/\`)

Each page gets its own folder:

\`\`\`
pages/<page>/
├── <page>.tsx         # Page component (default export)
├── routes.tsx         # Exports RouteObject[] for this page
├── index.ts           # Re-exports public members (routes)
├── components/        # Components private to this page (optional)
└── hooks/             # Page-local hooks (UI logic, not API hooks)
\`\`\`

**\`routes.tsx\`** — defines the route config using the \`Path\` enum:
\`\`\`tsx
import type { RouteObject } from 'react-router-dom'
import { Path } from '@/router/paths'
import SettingsPage from './settings'

export const settingsRoutes: RouteObject[] = [
  { path: Path.Settings, element: <SettingsPage /> },
]
\`\`\`

**\`index.ts\`** — re-exports only public members:
\`\`\`ts
export { settingsRoutes } from './routes'
\`\`\`

### Feature Pages (\`src/features/\`)

Features that have pages include a \`routes.tsx\` at the feature root:

\`\`\`
features/<feature>/
├── components/        # UI components scoped to this feature
├── hooks/             # Custom hooks (queries, mutations, logic)
├── pages/             # Page components (default exports)
├── routes.tsx         # RouteObject[] for all pages in this feature
└── index.ts           # Re-exports routes + public API
\`\`\`

**\`routes.tsx\`** — groups related routes using the \`Path\` enum:
\`\`\`tsx
import { Outlet, type RouteObject } from 'react-router-dom'
import { Path } from '@/router/paths'
import PostsPage from './pages/posts-page'
import PostDetailPage from './pages/post-detail-page'

export const postsRoutes: RouteObject[] = [
  {
    path: Path.Posts,
    element: <Outlet />,
    children: [
      { index: true, element: <PostsPage /> },
      { path: ':id', element: <PostDetailPage /> },
    ],
  },
]
\`\`\`

**\`index.ts\`** — exports routes first:
\`\`\`ts
export { postsRoutes } from './routes'
export { usePosts, useCreatePost, useUpdatePost, useDeletePost } from '@/api/hooks/posts'
\`\`\`

### Route Paths (\`src/router/paths.ts\`)

All route paths are defined in a central \`Path\` enum — **never use hardcoded path strings**:

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

Use \`Path\` everywhere — in route definitions, \`navigate()\`, \`<Link to={}\`\`, etc.:
\`\`\`tsx
import { Path } from '@/router/paths'

// In routes
{ path: Path.Dashboard, element: <DashboardPage /> }

// In navigation
navigate(Path.Login)
<Link to={Path.Home}>Home</Link>
\`\`\`

For dynamic paths, use the \`buildPath\` helper:
\`\`\`ts
import { Path, buildPath } from '@/router/paths'

buildPath(Path.ResetPassword, { token: 'abc123' })
// => '/reset-password/abc123'
\`\`\`

The \`Path\` enum is re-exported from \`@/router\` along with \`buildPath\`.

### Central Router (\`src/router/routes.tsx\`)

The central router imports and spreads route arrays — it never imports page components directly:

\`\`\`tsx
import { homeRoutes } from '@/pages/home'
import { dashboardRoutes } from '@/pages/dashboard'
import { authRoutes } from '@/features/auth'
import { postsRoutes } from '@/features/posts'
// blacksmith:import

const publicRoutes: RouteObject[] = [
  ...homeRoutes,
]

const privateRoutes: RouteObject[] = [
  ...dashboardRoutes,
  ...postsRoutes,
  // blacksmith:routes
]
\`\`\`

### Auto-Registration

\`blacksmith make:resource\` automatically registers routes using marker comments:
- \`// blacksmith:path\` — new \`Path\` enum entry is inserted above this marker in \`paths.ts\`
- \`// blacksmith:import\` — new import line is inserted above this marker in \`routes.tsx\`
- \`// blacksmith:routes\` — new spread line is inserted above this marker in \`routes.tsx\`

Never remove these markers. They must stay in the \`Path\` enum, \`privateRoutes\` array, and import block.

### When to Use Pages vs Features

| Use \`pages/<page>/\` | Use \`features/<feature>/\` |
|---|---|
| Standalone pages (home, dashboard, settings) | CRUD resources with multiple pages |
| No shared hooks or components | Has hooks, components, and pages that belong together |
| Single route | Multiple related routes (list + detail + edit) |

### Component Decomposition

> **RULE: Pages are orchestrators, not monoliths. Break every page into small, focused child components stored in \`components/\`.**

A page component should read data (via hooks), pass it down as props, and compose child components. It should contain minimal JSX itself.

\`\`\`
pages/dashboard/
├── dashboard.tsx              # Page: composes children, calls hooks
├── components/
│   ├── stats-cards.tsx        # Renders the stats grid
│   ├── recent-activity.tsx    # Renders activity feed
│   └── quick-actions.tsx      # Renders action buttons
├── hooks/
│   └── use-dashboard-data.ts  # All data fetching for this page
├── routes.tsx
└── index.ts
\`\`\`

\`\`\`tsx
// dashboard.tsx — thin orchestrator using @blacksmith-ui/react layout
import { Stack, Grid, Divider } from '@blacksmith-ui/react'
import { StatsCards } from './components/stats-cards'
import { RecentActivity } from './components/recent-activity'
import { QuickActions } from './components/quick-actions'
import { useDashboardData } from './hooks/use-dashboard-data'

export default function DashboardPage() {
  const { stats, activity, isLoading } = useDashboardData()

  return (
    <Stack gap={6}>
      <StatsCards stats={stats} isLoading={isLoading} />
      <Divider />
      <Grid columns={{ base: 1, lg: 3 }} gap={6}>
        <RecentActivity items={activity} isLoading={isLoading} className="lg:col-span-2" />
        <QuickActions />
      </Grid>
    </Stack>
  )
}
\`\`\`

**When to extract a child component:**
- A section of JSX exceeds ~30 lines
- A block has its own loading/error state
- A block is logically independent (e.g. a table, a form, a sidebar)
- A block could be reused on another page (move to \`shared/\` or the feature's \`components/\`)

**When NOT to extract:**
- A few lines of simple, static markup (headings, wrappers)
- Extracting would just move props through another layer with no clarity gain

### Separating Logic into Hooks

> **RULE: Components render. Hooks think. Never mix data fetching, transformations, or complex state logic into component bodies.**

Extract logic into hooks in the \`hooks/\` folder co-located with the page or feature:

\`\`\`tsx
// BAD — logic mixed into the component
export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data, isLoading } = useApiQuery({
    ...ordersListOptions({ query: { page, search: debouncedSearch } }),
    select: (d: any) => ({ orders: d.results ?? [], total: d.count ?? 0 }),
  })

  const deleteOrder = useApiMutation({
    ...ordersDestroyMutation(),
    invalidateKeys: [ordersListQueryKey()],
  })

  return ( /* 200 lines of JSX using all of the above */ )
}
\`\`\`

\`\`\`tsx
// GOOD — logic in a hook, component just renders
// hooks/use-orders-page.ts
export function useOrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, errorMessage } = useOrders({
    page,
    search: debouncedSearch,
  })

  const deleteOrder = useDeleteOrder()

  return { orders: data?.orders ?? [], total: data?.total ?? 0, isLoading, errorMessage, page, setPage, search, setSearch, deleteOrder }
}

// orders-page.tsx
import { Stack } from '@blacksmith-ui/react'
import { useOrdersPage } from './hooks/use-orders-page'
import { OrdersTable } from './components/orders-table'
import { OrdersToolbar } from './components/orders-toolbar'

export default function OrdersPage() {
  const { orders, total, isLoading, page, setPage, search, setSearch, deleteOrder } = useOrdersPage()

  return (
    <Stack gap={4}>
      <OrdersToolbar search={search} onSearchChange={setSearch} />
      <OrdersTable orders={orders} isLoading={isLoading} onDelete={(id) => deleteOrder.mutate({ path: { id } })} />
    </Stack>
  )
}
\`\`\`

**What goes into a hook:**
- API queries and mutations
- Derived/computed state
- Debouncing, pagination, filtering logic
- Form setup (\`useForm\`, schema, submit handler)
- Any \`useEffect\` or \`useState\` beyond a simple UI toggle

**What stays in the component:**
- Simple UI toggles (\`useState\` for a modal open/close is fine inline)
- JSX composition and prop passing
- Event handler wiring (calling \`hook.mutate()\`, \`navigate()\`, etc.)

### Key Rules

1. **Every page/feature owns its routes** — the route config lives next to the page, not in the central router
2. **Use the \`Path\` enum for all route paths** — never hardcode path strings; import \`Path\` from \`@/router/paths\`
3. **\`index.ts\` is the public API** — only export what other modules need (routes, hooks, components)
4. **Page components use default exports** — this is the one exception to the named-export convention
5. **Routes use named exports** — \`export const settingsRoutes\` not \`export default\`
6. **Private components/hooks stay in the page folder** — if only one page uses it, co-locate it there
7. **Never import across page folders** — if something is shared, move it to \`shared/\` or a feature
8. **Keep marker comments intact** — \`// blacksmith:path\`, \`// blacksmith:import\`, and \`// blacksmith:routes\` are required for auto-registration
9. **Pages are orchestrators** — break pages into child components in \`components/\`, extract logic into hooks in \`hooks/\`
10. **Components render, hooks think** — never put data fetching, transformations, or complex state directly in component bodies
`
  },
}
