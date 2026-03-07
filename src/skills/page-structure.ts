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
└── hooks/             # Hooks private to this page (optional)
\`\`\`

**\`routes.tsx\`** — defines the route config:
\`\`\`tsx
import type { RouteObject } from 'react-router-dom'
import SettingsPage from './settings'

export const settingsRoutes: RouteObject[] = [
  { path: '/settings', element: <SettingsPage /> },
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

**\`routes.tsx\`** — groups related routes:
\`\`\`tsx
import { Outlet, type RouteObject } from 'react-router-dom'
import PostsPage from './pages/posts-page'
import PostDetailPage from './pages/post-detail-page'

export const postsRoutes: RouteObject[] = [
  {
    path: '/posts',
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
export { usePosts } from './hooks/use-posts'
export { useCreatePost, useUpdatePost, useDeletePost } from './hooks/use-post-mutations'
\`\`\`

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
- \`// blacksmith:import\` — new import line is inserted above this marker
- \`// blacksmith:routes\` — new spread line is inserted above this marker

Never remove these markers. They must stay in the \`privateRoutes\` array and import block.

### When to Use Pages vs Features

| Use \`pages/<page>/\` | Use \`features/<feature>/\` |
|---|---|
| Standalone pages (home, dashboard, settings) | CRUD resources with multiple pages |
| No shared hooks or components | Has hooks, components, and pages that belong together |
| Single route | Multiple related routes (list + detail + edit) |

### Key Rules

1. **Every page/feature owns its routes** — the route config lives next to the page, not in the central router
2. **\`index.ts\` is the public API** — only export what other modules need (routes, hooks, components)
3. **Page components use default exports** — this is the one exception to the named-export convention
4. **Routes use named exports** — \`export const settingsRoutes\` not \`export default\`
5. **Private components/hooks stay in the page folder** — if only one page uses it, co-locate it there
6. **Never import across page folders** — if something is shared, move it to \`shared/\` or a feature
7. **Keep marker comments intact** — \`// blacksmith:import\` and \`// blacksmith:routes\` are required for auto-registration
`
  },
}
