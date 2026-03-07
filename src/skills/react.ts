import type { Skill, SkillContext } from './types.js'

export const reactSkill: Skill = {
  id: 'react',
  filename: 'react.md',

  render(_ctx: SkillContext): string {
    return `## React Frontend Conventions

### Tech Stack
- React 19 + TypeScript (strict mode)
- Vite for bundling and dev server
- TanStack React Query for server state management
- React Router v7 for client-side routing
- React Hook Form + Zod for forms and validation
- Tailwind CSS for styling
- \`@hey-api/openapi-ts\` for auto-generating API client from Django's OpenAPI schema
- \`lucide-react\` for icons

### API Layer
- Auto-generated client in \`frontend/src/api/generated/\` — **never edit these files manually**
- Custom API configuration (base URL, interceptors, auth headers) in \`frontend/src/api/client.ts\`
- Query client setup and default options in \`frontend/src/api/query-client.ts\`
- After any backend API change, run \`blacksmith sync\` to regenerate the client

### Page Structure
- Each page lives in its own folder under \`frontend/src/pages/<page>/\`
- Standard page folder structure:
  \`\`\`
  pages/<page>/
  ├── <page>.tsx       # Page component
  ├── routes.tsx       # RouteObject[] for this page (the exportable)
  ├── index.ts         # Re-exports (routes, etc.)
  ├── components/      # Components private to this page (optional)
  └── hooks/           # Hooks private to this page (optional)
  \`\`\`
- The \`routes.tsx\` exports a \`RouteObject[]\` that the central router composes
- The \`index.ts\` only exports public members (typically just the routes)

### Feature Modules
- Each feature lives in \`frontend/src/features/<feature>/\`
- Standard structure:
  \`\`\`
  features/<feature>/
  ├── components/    # UI components scoped to this feature
  ├── hooks/         # Custom hooks (queries, mutations, logic)
  ├── pages/         # Route-level page components
  ├── routes.tsx     # RouteObject[] for this feature's pages
  └── index.ts       # Public API — re-export routes and what other features may import
  \`\`\`
- Keep features self-contained; import from other features only through their \`index.ts\`
- Shared, cross-feature code lives in \`frontend/src/shared/\`

### Routing
- Each page/feature owns its own \`routes.tsx\` that exports a \`RouteObject[]\`
- \`frontend/src/router/routes.tsx\` composes all route arrays into the final config — it imports and spreads route objects, not page components directly
- Routes are organized into \`publicRoutes\`, \`privateRoutes\` (wrapped in \`AuthGuard\`), and \`authRoutes\`
- Router created in \`frontend/src/router/index.tsx\` via \`createBrowserRouter\`
- Auth guards in \`frontend/src/router/auth-guard.tsx\` — \`privateRoutes\` are automatically wrapped
- Layouts in \`frontend/src/router/layouts/\`:
  - \`main-layout.tsx\` — App shell with navbar for app pages
  - \`auth-layout.tsx\` — Minimal layout for login/register/reset pages
- Marker comments \`// blacksmith:import\` and \`// blacksmith:routes\` in \`routes.tsx\` enable auto-registration by \`blacksmith make:resource\`

### State Management
- **Server state**: TanStack React Query — see the \`react-query\` skill for full conventions on \`useApiQuery\` and \`useApiMutation\`
- **Form state**: React Hook Form — manages form values, validation, submission
- **Local UI state**: React \`useState\` / \`useReducer\` for component-scoped state
- Avoid global state libraries unless there is a clear cross-cutting concern not covered by React Query

### Component Patterns
- Use functional components with named exports (not default exports for components)
- Co-locate component, hook, and type in the same feature directory
- Keep components focused — extract sub-components when a file exceeds ~150 lines
- Use custom hooks to encapsulate data fetching and mutation logic
- Prefer composition over prop drilling — use context for deeply shared state

### Styling
- Use Tailwind CSS utility classes for all styling
- Use the \`cn()\` helper (from \`clsx\` + \`tailwind-merge\`) for conditional and merged classes
- Theming via HSL CSS variables defined in \`frontend/src/styles/globals.css\`
- Dark mode is supported via the \`class\` strategy on \`<html>\`
- Use responsive prefixes (\`sm:\`, \`md:\`, \`lg:\`) for responsive layouts
- Avoid inline \`style\` attributes — use Tailwind classes instead

### Path Aliases
- \`@/\` maps to \`frontend/src/\`
- Always use the alias for imports: \`import { useAuth } from '@/features/auth'\`
- Never use relative paths that go up more than one level (\`../../\`)

### Error Handling
- Use React Error Boundary (\`frontend/src/router/error-boundary.tsx\`) for render errors
- API errors are handled by \`useApiQuery\` / \`useApiMutation\` — see the \`react-query\` skill for error display patterns
- Display user-facing errors using the project's feedback components (Alert, Toast)

### Testing
- Run all tests: \`cd frontend && npm test\`
- Run a specific test: \`cd frontend && npm test -- --grep "test name"\`
- Test files live alongside the code they test (\`component.test.tsx\`)
`
  },
}
