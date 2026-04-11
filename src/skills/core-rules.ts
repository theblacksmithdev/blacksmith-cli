import type { Skill, SkillContext } from './types.js'

/**
 * Core Rules — Inlined directly into CLAUDE.md (no `name` property).
 *
 * These are the most critical rules that must always be visible to the AI.
 * They are NOT a separate skill file — they appear at the top of CLAUDE.md.
 */
export const coreRulesSkill: Skill = {
  id: 'core-rules',
  // No `name` → content is inlined directly into CLAUDE.md, not a separate file

  render(_ctx: SkillContext): string {
    return `## Critical Rules

> **These rules are mandatory. Violating them produces broken, inconsistent code.**

### 1. Use \`@chakra-ui/react\` for ALL UI
- **Layout**: Use \`VStack\`, \`HStack\`, \`Flex\`, \`SimpleGrid\`, \`Box\`, \`Container\` — NEVER \`<div className="flex ...">\` or \`<div className="grid ...">\`
- **Typography**: Use \`Heading\` and \`Text\` — NEVER raw \`<h1>\`–\`<h6>\`, \`<p>\`, or \`<span>\` with text classes
- **Separators**: Use \`Divider\` — NEVER \`<hr>\`
- **Everything else**: \`Button\`, \`Card\`, \`Badge\`, \`Input\`, \`Table\`, \`Modal\`, \`Alert\`, \`Skeleton\`, \`Stat\`, etc.
- See the \`chakra-ui-react\` skill for the full component list

### 2. Pages Are Thin Orchestrators
- A page file should be ~20-30 lines: import components, call hooks, compose JSX
- Break every page into child components in a \`components/\` folder
- See the \`page-structure\` skill for the full pattern with examples

### 3. Components Render, Hooks Think
- Extract ALL logic into hooks in a \`hooks/\` folder — API calls, mutations, form setup, filtering, pagination, debouncing, computed state
- Components should contain only JSX composition, prop passing, and simple event handler wiring
- The only \`useState\` acceptable inline in a component is a simple UI toggle (e.g. modal open/close)
- If a component has more than one \`useState\`, one \`useEffect\`, or any \`useApiQuery\`/\`useApiMutation\` — extract to a hook

### 4. Use the \`Path\` Enum — Never Hardcode Paths
- All route paths are in \`src/router/paths.ts\` as a \`Path\` enum
- Use \`Path.Login\`, \`Path.Dashboard\`, etc. in \`navigate()\`, \`<Link to={}>\`, and route definitions
- When adding a new page, add its path to the enum before \`// blacksmith:path\`
- Use \`buildPath(Path.ResetPassword, { token })\` for dynamic segments

### 5. API Hooks Live in \`src/api/hooks/\`
- All API data access hooks go in \`src/api/hooks/<resource>/\` — never in page-level \`hooks/\` folders
- Each resource gets a folder with \`use-<resources>.ts\` (queries), \`use-<resource>-mutations.ts\` (mutations), and \`index.ts\` (re-exports)
- Import as: \`import { usePosts, useCreatePost } from '@/api/hooks/posts'\`
- See the \`react-query\` skill for full conventions

### 6. Use Generated API Client Code
- Always check \`src/api/generated/\` first before writing any API calls — use the generated types, query options, mutations, and query keys
- Only write manual API client code when no generated code exists for the endpoint (e.g. the endpoint hasn't been synced yet)
- **In fullstack projects:** after creating or modifying any backend endpoint (views, serializers, URLs), run \`blacksmith sync\` from the project root to regenerate the frontend API client before writing frontend code that consumes it

### 7. Follow the Page/Feature Folder Structure
\`\`\`
pages/<page>/
├── <page>.tsx         # Thin orchestrator (default export)
├── routes.tsx         # RouteObject[] using Path enum
├── index.ts           # Re-exports public API
├── components/        # Child components
└── hooks/             # Page-local hooks (UI logic only, not API hooks)
\`\`\`
- See the \`page-structure\` skill for full conventions
`
  },
}
