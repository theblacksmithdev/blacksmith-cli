import type { Skill, SkillContext } from './types.js'
import { backendProfile } from './backend-profiles.js'

export const projectOverviewSkill: Skill = {
  id: 'project-overview',
  name: 'Project Overview',
  description: 'Overview of the project structure, commands, and development workflow.',

  render(ctx: SkillContext): string {
    const backend = backendProfile(ctx)

    return `# ${ctx.projectName}

A web application scaffolded by **Blacksmith CLI**. Check \`blacksmith.config.json\` at the project root for the project type (\`fullstack\`, \`backend\`, or \`frontend\`) and configuration.

## Project Structure

The structure depends on the project type configured in \`blacksmith.config.json\`:

**Fullstack** (\`type: "fullstack"\`) — ${backend.name} backend + React frontend in subdirectories:
\`\`\`
${ctx.projectName}/
├── backend/              # ${backend.name} project
${backend.tree}
├── frontend/             # React + Vite project
│   ├── src/
│   │   ├── api/          # API client and hooks
│   │   ├── features/     # Feature modules (auth, etc.)
│   │   ├── pages/        # Top-level pages
│   │   ├── router/       # React Router setup and layouts
│   │   ├── shared/       # Shared components (ui/ = Chakra glue), hooks, utils
│   │   └── theme/        # Chakra UI v3 design system (tokens, recipes, presets)
│   └── package.json
├── blacksmith.config.json
└── CLAUDE.md
\`\`\`

**Backend-only** (\`type: "backend"\`) — ${backend.name} project at root:
\`\`\`
${ctx.projectName}/
${backend.rootTree}
└── blacksmith.config.json
\`\`\`

**Frontend-only** (\`type: "frontend"\`) — React project at root:
\`\`\`
${ctx.projectName}/
├── src/
│   ├── api/
│   ├── pages/
│   ├── router/
│   ├── shared/
│   └── theme/
├── package.json
└── blacksmith.config.json
\`\`\`

## Commands

| Command | Fullstack | Backend | Frontend |
|---|---|---|---|
| \`blacksmith dev\` | ${backend.name} + Vite + sync | ${backend.name} only | Vite only |
| \`blacksmith sync\` | Regenerate frontend types | N/A | N/A |
| \`blacksmith make:resource <Name>\` | Both ends | Backend only | Frontend only |
| \`blacksmith build\` | Both | ${backend.build} | Vite build |
| \`blacksmith eject\` | Remove Blacksmith | Remove Blacksmith | Remove Blacksmith |

## Development Workflow

**Fullstack:**
1. ${backend.defineFeature} in the backend
2. Run \`blacksmith sync\` to generate TypeScript types and API client
3. Build frontend features using the generated hooks and types

**Backend-only:**
1. ${backend.defineFeature}
2. Run migrations and test endpoints

**Frontend-only:**
1. Build pages and components
2. Create API hooks in \`src/api/hooks/\` for data fetching
`
  },
}
