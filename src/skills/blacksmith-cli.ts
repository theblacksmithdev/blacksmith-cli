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
| \`blacksmith dev\` | Start development server(s) |
| \`blacksmith sync\` | Regenerate frontend API client from Django OpenAPI schema (fullstack only) |
| \`blacksmith make:resource <Name>\` | Scaffold a resource (backend, frontend, or both depending on project type) |
| \`blacksmith build\` | Production build |
| \`blacksmith eject\` | Remove Blacksmith dependency, keep a clean project |
| \`blacksmith setup:ai\` | Generate/regenerate CLAUDE.md with AI development skills |
| \`blacksmith skills\` | List all available AI development skills |

### Configuration

Project settings are stored in \`blacksmith.config.json\` at the project root:

\`\`\`json
{
  "name": "my-app",
  "version": "0.1.0",
  "type": "fullstack",
  "backend": { "port": 8000 },
  "frontend": { "port": 5173 }
}
\`\`\`

- **\`type\`** — \`"fullstack"\`, \`"backend"\`, or \`"frontend"\`. Determines which commands and steps are available
- **\`backend\`** — present for fullstack and backend projects. Absent for frontend-only
- **\`frontend\`** — present for fullstack and frontend projects. Absent for backend-only
- **Ports** are read by \`blacksmith dev\` — change them here, not in code
- The CLI finds the project root by walking up directories looking for this file

### How \`blacksmith dev\` Works

Depends on project type:
- **Fullstack**: Runs three concurrent processes — Django, Vite, and an OpenAPI file watcher (auto-syncs types on \`.py\` changes)
- **Backend**: Runs Django only
- **Frontend**: Runs Vite only

All processes are managed by \`concurrently\` and stop together on Ctrl+C.

### How \`blacksmith make:resource\` Works

Given a PascalCase name (e.g. \`BlogPost\`), it scaffolds based on project type:

**Backend (fullstack and backend projects):**
- \`apps/blog_posts/\` — model, serializer, viewset, urls, admin, tests
- Wires the app into \`INSTALLED_APPS\` and \`config/urls.py\`
- Runs \`makemigrations\` and \`migrate\`

**Frontend (fullstack and frontend projects):**
- \`src/api/hooks/blog-posts/\` — query and mutation hooks
- \`src/pages/blog-posts/\` — list and detail pages
- Registers route path in \`src/router/paths.ts\` and routes in \`src/router/routes.tsx\`

**Fullstack only:** Also runs \`blacksmith sync\` to generate the TypeScript API client.

### How \`blacksmith sync\` Works (Fullstack Only)

1. Generates the OpenAPI schema offline using \`manage.py spectacular\`
2. Runs \`openapi-ts\` to generate TypeScript types, Zod schemas, SDK functions, and TanStack Query hooks
3. Output goes to \`frontend/src/api/generated/\` — never edit these files manually

### Init Flags

\`blacksmith init\` supports both interactive prompts and CLI flags:

\`\`\`bash
# Fully interactive
blacksmith init

# Skip prompts with flags
blacksmith init my-app --type fullstack -b 9000 -f 3000 --ai
\`\`\`

| Flag | Description |
|---|---|
| \`--type <type>\` | Project type: fullstack, backend, or frontend (default: fullstack) |
| \`-b, --backend-port <port>\` | Django port (default: 8000) |
| \`-f, --frontend-port <port>\` | Vite port (default: 5173) |
| \`--ai\` | Generate CLAUDE.md with project skills |
| \`--no-chakra-ui-skill\` | Exclude Chakra UI skill from CLAUDE.md |
`
  },
}
