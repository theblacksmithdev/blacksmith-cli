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

### 1. Use \`@blacksmith-ui/react\` for ALL UI
- **Layout**: Use \`Stack\`, \`Flex\`, \`Grid\`, \`Box\`, \`Container\` — NEVER \`<div className="flex ...">\` or \`<div className="grid ...">\`
- **Typography**: Use \`Typography\` and \`Text\` — NEVER raw \`<h1>\`–\`<h6>\`, \`<p>\`, or \`<span>\` with text classes
- **Separators**: Use \`Divider\` — NEVER \`<hr>\` or \`<Separator>\`
- **Everything else**: \`Button\`, \`Card\`, \`Badge\`, \`Input\`, \`Table\`, \`Dialog\`, \`Alert\`, \`Skeleton\`, \`EmptyState\`, \`StatCard\`, etc.
- See the \`blacksmith-ui-react\` skill for the full 60+ component list

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

### 5. Follow the Page/Feature Folder Structure
\`\`\`
pages/<page>/
├── <page>.tsx         # Thin orchestrator (default export)
├── routes.tsx         # RouteObject[] using Path enum
├── index.ts           # Re-exports public API
├── components/        # Child components
└── hooks/             # Page-local hooks (UI logic, not API hooks)
\`\`\`
- See the \`page-structure\` skill for full conventions
`
  },
}
