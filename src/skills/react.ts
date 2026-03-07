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

### Project Structure
- See the \`page-structure\` skill for page folders, feature modules, routing, and route composition conventions
- Shared, cross-feature code lives in \`frontend/src/shared/\`

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
