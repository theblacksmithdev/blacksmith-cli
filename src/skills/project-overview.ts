import type { Skill, SkillContext } from './types.js'

export const projectOverviewSkill: Skill = {
  id: 'project-overview',
  name: 'Project Overview',
  description: 'Overview of the project structure, commands, and development workflow.',

  render(ctx: SkillContext): string {
    const isExpress = ctx.backendFramework === 'express'
    const backendName = isExpress ? 'Express' : 'Django'

    const backendTree = isExpress
      ? `│   ├── src/
│   │   ├── config/       # env, Zod, OpenAPI registry
│   │   ├── db/           # Prisma client
│   │   ├── middleware/   # auth, validation, error handling
│   │   ├── modules/      # one folder per resource
│   │   └── utils/        # errors, pagination, tokens
│   ├── prisma/           # schema.prisma and migrations
│   └── package.json`
      : `│   ├── apps/             # Django apps (one per resource)
│   ├── config/           # Django settings, urls, wsgi/asgi
│   ├── utils/            # Shared backend utilities
│   ├── manage.py
│   └── venv/             # Python virtual environment`

    const backendOnlyTree = isExpress
      ? `├── src/
├── prisma/
├── package.json`
      : `├── apps/
├── config/
├── utils/
├── manage.py
├── venv/`

    return `# ${ctx.projectName}

A web application scaffolded by **Blacksmith CLI**. Check \`blacksmith.config.json\` at the project root for the project type (\`fullstack\`, \`backend\`, or \`frontend\`) and configuration.

## Project Structure

The structure depends on the project type configured in \`blacksmith.config.json\`:

**Fullstack** (\`type: "fullstack"\`) — ${backendName} backend + React frontend in subdirectories:
\`\`\`
${ctx.projectName}/
├── backend/              # ${backendName} project
${backendTree}
├── frontend/             # React + Vite project
│   ├── src/
│   │   ├── api/          # API client and hooks
│   │   ├── features/     # Feature modules (auth, etc.)
│   │   ├── pages/        # Top-level pages
│   │   ├── router/       # React Router setup
│   │   └── shared/       # Shared components, hooks, utils
│   └── package.json
├── blacksmith.config.json
└── CLAUDE.md
\`\`\`

**Backend-only** (\`type: "backend"\`) — ${backendName} project at root:
\`\`\`
${ctx.projectName}/
${backendOnlyTree}
└── blacksmith.config.json
\`\`\`

**Frontend-only** (\`type: "frontend"\`) — React project at root:
\`\`\`
${ctx.projectName}/
├── src/
│   ├── api/
│   ├── pages/
│   ├── router/
│   └── shared/
├── package.json
└── blacksmith.config.json
\`\`\`

## Commands

| Command | Fullstack | Backend | Frontend |
|---|---|---|---|
| \`blacksmith dev\` | ${backendName} + Vite + sync | ${backendName} only | Vite only |
| \`blacksmith sync\` | Regenerate frontend types | N/A | N/A |
| \`blacksmith make:resource <Name>\` | Both ends | Backend only | Frontend only |
| \`blacksmith build\` | Both | ${isExpress ? 'tsc build' : 'collectstatic'} | Vite build |
| \`blacksmith eject\` | Remove Blacksmith | Remove Blacksmith | Remove Blacksmith |

## Development Workflow

**Fullstack:**
1. ${isExpress ? 'Define the Prisma model, Zod schemas, service, and routes' : 'Define models, serializers, and viewsets'} in the backend
2. Run \`blacksmith sync\` to generate TypeScript types and API client
3. Build frontend features using the generated hooks and types

**Backend-only:**
1. ${isExpress ? 'Define the Prisma model, Zod schemas, service, and routes' : 'Define models, serializers, and viewsets'}
2. Run migrations and test endpoints

**Frontend-only:**
1. Build pages and components
2. Create API hooks in \`src/api/hooks/\` for data fetching
`
  },
}
