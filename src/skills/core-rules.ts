import type { Skill, SkillContext } from './types.js'
import { frontendProfile } from './frontend-profiles.js'

/**
 * Core Rules — Inlined directly into CLAUDE.md (no `name` property).
 *
 * These are the most critical rules that must always be visible to the AI.
 * They are NOT a separate skill file — they appear at the top of CLAUDE.md.
 */
export const coreRulesSkill: Skill = {
  id: 'core-rules',
  // No `name` → content is inlined directly into CLAUDE.md, not a separate file

  render(ctx: SkillContext): string {
    const frontend = frontendProfile(ctx)

    return `## Critical Rules

> **These rules are mandatory. Violating them produces broken, inconsistent code.**

### 1. ${frontend.rules.ui}

### 2. ${frontend.rules.pages}

### 3. ${frontend.rules.logic}

### 4. ${frontend.rules.paths}

### 5. ${frontend.rules.api}

### 6. Use Generated API Client Code
- Always check \`src/api/generated/\` first before writing any API calls — use the generated types, query options, mutations, and query keys
- Only write manual API client code when no generated code exists for the endpoint (e.g. the endpoint hasn't been synced yet)
- **In fullstack projects:** after creating or modifying any backend endpoint (views, serializers, URLs), run \`blacksmith sync\` from the project root to regenerate the frontend API client before writing frontend code that consumes it

### 7. Prioritize Modularization and Code Reuse
- **Always reuse before writing** — before creating a new function, search the codebase for an existing one that does the same thing or can be extended
- **Extract reusable logic to utils** — if a function can be useful outside the file it lives in, move it to a \`utils/\` folder. This applies to both frontend and backend
  - Frontend: page/feature-scoped → \`<page>/utils/\`; app-wide → \`src/shared/utils/\`
  - Backend: app-scoped → \`apps/<app>/utils.py\` (or \`utils/\` package); project-wide → \`utils/\` at the backend root
- **No inline helper functions** — standalone functions sitting in component files, view files, or serializer files should be extracted to utils
- **No duplicated logic** — if the same logic appears in two places, extract it into a shared utility immediately
- See the \`frontend-modularization\` and \`backend-modularization\` skills for full conventions

### 8. ${frontend.rules.folders}
`
  },
}
