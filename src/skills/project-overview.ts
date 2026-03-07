import type { Skill, SkillContext } from './types.js'

export const projectOverviewSkill: Skill = {
  id: 'project-overview',

  render(ctx: SkillContext): string {
    return `# ${ctx.projectName}

A fullstack web application built with **Django** (backend) and **React** (frontend), scaffolded by **Blacksmith CLI**.

## Project Structure

\`\`\`
${ctx.projectName}/
├── backend/              # Django project
│   ├── apps/             # Django apps (one per resource)
│   │   └── users/        # Built-in user app
│   ├── config/           # Django settings, urls, wsgi/asgi
│   │   └── settings/     # Split settings (base, development, production)
│   ├── manage.py
│   ├── requirements.txt
│   └── venv/             # Python virtual environment
├── frontend/             # React + Vite project
│   ├── src/
│   │   ├── api/          # API client (auto-generated from OpenAPI)
│   │   ├── features/     # Feature modules (auth, etc.)
│   │   ├── pages/        # Top-level pages
│   │   ├── router/       # React Router setup with guards
│   │   ├── shared/       # Shared components and hooks
│   │   └── styles/       # Global styles (Tailwind)
│   ├── package.json
│   └── tailwind.config.js
├── blacksmith.config.json
└── CLAUDE.md             # This file
\`\`\`

## Commands

- \`blacksmith dev\` — Start Django + Vite + OpenAPI sync in parallel
- \`blacksmith sync\` — Regenerate frontend API types from Django OpenAPI schema
- \`blacksmith make:resource <Name>\` — Scaffold a full resource (model, serializer, viewset, hooks, pages)
- \`blacksmith build\` — Production build (frontend + collectstatic)
- \`blacksmith eject\` — Remove Blacksmith, keep a clean Django + React project

## Development Workflow

1. Define models in \`backend/apps/<app>/models.py\`
2. Create serializers in \`backend/apps/<app>/serializers.py\`
3. Add viewsets in \`backend/apps/<app>/views.py\` and register URLs in \`backend/apps/<app>/urls.py\`
4. Run \`blacksmith sync\` to generate TypeScript types and API client
5. Build frontend features using generated hooks in \`frontend/src/features/\`
`
  },
}
