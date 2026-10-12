import type { Skill, SkillContext } from './types.js'
import { backendProfile } from './backend-profiles.js'

export const aiGuidelinesSkill: Skill = {
  id: 'ai-guidelines',
  name: 'AI Development Guidelines',
  description: 'Guidelines for developing the project using AI, including when to use code generation, code style, environment setup, and a checklist before finishing tasks.',

  render(ctx: SkillContext): string {
    const backend = backendProfile(ctx)

    return `## AI Development Guidelines

### When Adding Features
1. Use \`blacksmith make:resource <Name>\` for new CRUD resources — it scaffolds the appropriate files based on project type
2. **Fullstack projects:** After any backend API change (new endpoint, changed schema, new field), run \`blacksmith sync\` from the project root to regenerate the frontend API client and types
3. Never manually edit files in \`src/api/generated/\` — they are overwritten on every sync
4. Before writing any new function, search the codebase for an existing one that does the same thing

### Code Style
- **Backend**: ${backend.codeStyle}
- **Frontend**: TypeScript strict mode. Functional components. Named exports (not default, except for page components used in routes). Descriptive variable names
- Use existing patterns in the codebase as reference before inventing new ones

### Frontend Architecture (Mandatory)
- **Use \`@chakra-ui/react\` for ALL UI** — \`Stack\`, \`HStack\`, \`Flex\`, \`SimpleGrid\` for layout; \`Heading\`, \`Text\` for text; \`Card.Root\`, \`Button\`, \`Badge\`, etc. for all elements (Chakra v3 APIs, semantic color tokens, no Tailwind). Never use raw HTML (\`<div>\`, \`<h1>\`, \`<p>\`, \`<button>\`) when a Chakra UI component exists. Semantic landmarks (\`<main>\`, \`<section>\`, \`<nav>\`, etc.) are the only exception
- **Pages are thin orchestrators** — compose child components from \`components/\`, extract logic into \`hooks/\`. Aim for clarity over strict line counts
- **Use the \`Path\` enum** — all route paths come from \`src/router/paths.ts\`. Never hardcode path strings
- **One component per file** — promote complex components to folders with barrel exports (see \`frontend-modularization\` skill)

### Environment
- Check \`blacksmith.config.json\` for configured ports and project type
- Start everything: \`blacksmith dev\`
- API docs (fullstack/backend): \`http://localhost:<backend-port>/api/docs/\` (Swagger) or \`/api/redoc/\`
- ${backend.toolchain}

### Checklist Before Finishing a Task
1. Tests pass: \`blacksmith test\` from the project root (runs the backend and frontend suites the project has)
2. Frontend builds (if project has frontend): \`npm run build\` in the frontend directory
3. API types are in sync (fullstack only): \`blacksmith sync\`
4. No lint errors in modified files
5. All UI uses \`@chakra-ui/react\` v3 components — no raw \`<div>\` for layout, no raw \`<h1>\`-\`<h6>\` for text, no hardcoded colors
6. Pages are modular — page file is a thin orchestrator, sections are in \`components/\`, logic in \`hooks/\`
7. Logic is in hooks — no \`useApiQuery\`, \`useApiMutation\`, \`useEffect\`, or multi-\`useState\` in component bodies
8. No hardcoded route paths — all paths use the \`Path\` enum from \`@/router/paths\`
9. No duplicated logic — reusable functions are extracted to \`utils/\`
10. Tests are co-located — every new or modified page, component, or hook has a corresponding \`.spec.tsx\` / \`.spec.ts\` in a \`__tests__/\` folder next to the source file
`
  },
}
