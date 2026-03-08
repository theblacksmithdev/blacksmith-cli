import type { Skill, SkillContext } from './types.js'

export const blacksmithCliSkill: Skill = {
  id: 'blacksmith-cli',
  name: 'Blacksmith CLI',
  description: 'CLI commands, configuration, and workflows for project scaffolding and management.',

  render(_ctx: SkillContext): string {
    return `## Blacksmith CLI

Blacksmith is the CLI that scaffolded and manages this project. It lives outside the project directory as a globally installed npm package.

### Commands Reference

| Command | Description |
|---|---|
| \`blacksmith init [name]\` | Create a new project (interactive prompts if no flags) |
| \`blacksmith dev\` | Start Django + Vite + OpenAPI watcher in parallel |
| \`blacksmith sync\` | Regenerate frontend API client from Django OpenAPI schema |
| \`blacksmith make:resource <Name>\` | Scaffold a full CRUD resource across backend and frontend |
| \`blacksmith build\` | Production build (Vite build + Django collectstatic) |
| \`blacksmith eject\` | Remove Blacksmith dependency, keep a clean project |
| \`blacksmith setup:ai\` | Generate CLAUDE.md with AI development skills |
| \`blacksmith skills\` | List all available AI development skills |

### Configuration

Project settings are stored in \`blacksmith.config.json\` at the project root:

\`\`\`json
{
  "name": "my-app",
  "version": "0.1.0",
  "backend": { "port": 8000 },
  "frontend": { "port": 5173 }
}
\`\`\`

- **Ports** are read by \`blacksmith dev\` and \`blacksmith sync\` — change them here, not in code
- The CLI finds the project root by walking up directories looking for this file

### How \`blacksmith dev\` Works

Runs three concurrent processes:
1. **Django** — \`./venv/bin/python manage.py runserver 0.0.0.0:<backend-port>\`
2. **Vite** — \`npm run dev\` in the frontend directory
3. **OpenAPI watcher** — watches \`.py\` files in backend, runs \`npx openapi-ts\` on changes (2s debounce)

All three are managed by \`concurrently\` and stop together on Ctrl+C.

### How \`blacksmith make:resource\` Works

Given a PascalCase name (e.g. \`BlogPost\`), it generates:

**Backend:**
- \`backend/apps/blog_posts/models.py\` — Django model with timestamps
- \`backend/apps/blog_posts/serializers.py\` — DRF ModelSerializer
- \`backend/apps/blog_posts/views.py\` — DRF ModelViewSet with drf-spectacular schemas
- \`backend/apps/blog_posts/urls.py\` — DefaultRouter registration
- \`backend/apps/blog_posts/admin.py\` — Admin registration
- Wires the app into \`INSTALLED_APPS\` and \`config/urls.py\`
- Runs \`makemigrations\` and \`migrate\`

**Frontend:**
- \`frontend/src/features/blog-posts/\` — Feature module with hooks and components
- \`frontend/src/pages/blog-posts/\` — List and detail pages
- Registers route path in \`frontend/src/router/paths.ts\` (\`Path\` enum)
- Registers routes in \`frontend/src/router/routes.tsx\`

Then runs \`blacksmith sync\` to generate the TypeScript API client.

### How \`blacksmith sync\` Works

1. Fetches the OpenAPI schema from \`http://localhost:<backend-port>/api/schema/\`
2. Runs \`openapi-ts\` to generate TypeScript types, Zod schemas, SDK functions, and TanStack Query hooks
3. Output goes to \`frontend/src/api/generated/\` — never edit these files manually

### Init Flags

\`blacksmith init\` supports both interactive prompts and CLI flags:

\`\`\`bash
# Fully interactive
blacksmith init

# Skip prompts with flags
blacksmith init my-app -b 9000 -f 3000 --ai
\`\`\`

| Flag | Description |
|---|---|
| \`-b, --backend-port <port>\` | Django port (default: 8000) |
| \`-f, --frontend-port <port>\` | Vite port (default: 5173) |
| \`--ai\` | Generate CLAUDE.md with project skills |
| \`--no-blacksmith-ui-skill\` | Exclude blacksmith-ui skill from CLAUDE.md |
`
  },
}
