import type { Skill, SkillContext } from './types.js'

export const reactSkill: Skill = {
  id: 'react',
  name: 'React Frontend Conventions',
  description: 'Tech stack, project structure, state management, component patterns, styling, and testing for the React frontend.',

  render(_ctx: SkillContext): string {
    return `## React Frontend Conventions

### Tech Stack
- React 19 + TypeScript (strict mode)
- Vite for bundling and dev server
- TanStack React Query for server state management
- React Router v7 for client-side routing
- React Hook Form + Zod for forms and validation
- Chakra UI v3 for components, theming and styling (no Tailwind)
- \`@fontsource-variable/inter\` for typography
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
- **Pages must be thin orchestrators** — break into child components in \`components/\`, extract logic into \`hooks/\`. See the \`page-structure\` skill for the full pattern

### UI Components
- **All UI must use \`@chakra-ui/react\` components** — see the \`chakra-ui-react\` skill for the full component list
- Use \`Stack\`, \`HStack\`, \`Flex\`, \`SimpleGrid\`, \`Box\` for layout (with \`gap\`) — never styled \`<div>\`s
- Use \`Heading\` and \`Text\` for headings and text — never raw \`<h1>\`–\`<h6>\` or \`<p>\`
- Use \`Separator\` instead of \`<hr>\`
- Use \`Stat\`, \`Skeleton\`, \`EmptyState\` instead of building custom equivalents
- Reuse the shared components in \`src/shared/components/\` before writing new ones: \`PageHeader\`, \`StatusAlert\`, \`StatusPage\`, \`InfoCard\`, \`CommandSnippet\`, \`LoadingSpinner\`, \`BrandLogo\`, and \`RouterLink\` / \`ColorModeButton\` / \`Provider\` in \`ui/\`

### Route Paths
- All route paths live in the \`Path\` enum at \`src/router/paths.ts\` — **never hardcode path strings**
- Use \`Path\` in route definitions, \`navigate()\`, and \`<Link to={}>\`
- Use \`buildPath()\` for dynamic segments — see the \`page-structure\` skill for details

### Styling
- Use Chakra UI style props as the only styling approach — there is no Tailwind and no \`className\` utilities
- The design system lives in \`src/theme/\` (\`createSystem(defaultConfig, config)\`): tokens, semantic tokens, recipe overrides, global CSS and the theme preset (\`presets.ts\`)
- The default look is OpenAI-inspired: monochrome surfaces, hairline borders, pill-shaped controls, tight Inter type
- Use semantic tokens only — \`bg\`, \`bg.subtle\`, \`bg.muted\`, \`bg.panel\`, \`fg\`, \`fg.muted\`, \`fg.subtle\`, \`border\`, \`border.emphasized\`, \`colorPalette.solid\`; radii \`l1\`/\`l2\`/\`l3\`/\`control\`; shadow \`panel\`. Never hex values or \`gray.500\`
- Change a component's look in \`src/theme/recipes.ts\` / \`slot-recipes.ts\`; share reusable style objects via \`src/theme/styles.ts\` (e.g. \`css={interactiveCard}\`)
- Color mode: \`useColorMode()\` from \`@/shared/hooks/use-color-mode\`; dark styles come from semantic tokens or the \`_dark\` condition
- Use responsive props (\`{{ base: ..., md: ..., lg: ... }}\`) for responsive layouts
- Avoid inline \`style\` attributes — use Chakra style props instead

### Path Aliases
- \`@/\` maps to \`frontend/src/\`
- Always use the alias for imports: \`import { useAuth } from '@/features/auth'\`
- Never use relative paths that go up more than one level (\`../../\`)

### Error Handling
- Use React Error Boundary (\`frontend/src/router/error-boundary.tsx\`) for render errors
- API errors are handled by \`useApiQuery\` / \`useApiMutation\` — see the \`react-query\` skill for error display patterns
- Display user-facing errors using the project's feedback components (\`StatusAlert\`, toaster)

### Testing
- See the \`frontend-testing\` skill for full conventions on test placement, utilities, mocking, and what to test
- **Every code change must include corresponding tests** — see the \`frontend-testing\` skill for the complete rules
- Tests use \`.spec.tsx\` / \`.spec.ts\` and live in \`__tests__/\` folders co-located with source code
- Always use \`renderWithProviders\` from \`@/__tests__/test-utils\` — never import \`render\` from \`@testing-library/react\` directly
`
  },
}
