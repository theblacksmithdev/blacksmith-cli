import type { Skill, SkillContext } from './types.js'

export const aiGuidelinesSkill: Skill = {
  id: 'ai-guidelines',
  name: 'AI Development Guidelines',
  description: 'Guidelines for developing the project using AI, including when to use code generation, code style, environment setup, and a checklist before finishing tasks.',

  render(_ctx: SkillContext): string {
    return `## AI Development Guidelines

### When Adding Features
1. Use \`blacksmith make:resource <Name>\` for new CRUD resources — it scaffolds model, serializer, viewset, URLs, hooks, components, and pages across both backend and frontend
2. After any backend API change (new endpoint, changed schema, new field), run \`blacksmith sync\` to regenerate the frontend API client and types
3. Never manually edit files in \`frontend/src/api/generated/\` — they are overwritten on every sync

### Code Style
- **Backend**: Follow PEP 8. Use Django and DRF conventions. Docstrings on models, serializers, and non-obvious view methods
- **Frontend**: TypeScript strict mode. Functional components. Named exports (not default, except for page components used in routes). Descriptive variable names
- Use existing patterns in the codebase as reference before inventing new ones

### Frontend Architecture (Mandatory)
- **Use \`@blacksmith-ui/react\` for ALL UI** — \`Stack\`, \`Flex\`, \`Grid\` for layout; \`Typography\`, \`Text\` for text; \`Card\`, \`Button\`, \`Badge\`, etc. for all elements. Never use raw HTML (\`<div>\`, \`<h1>\`, \`<p>\`, \`<button>\`) when a Blacksmith-UI component exists
- **Pages are thin orchestrators** — compose child components from \`components/\`, extract logic into \`hooks/\`. A page file should be ~20-30 lines, not a monolith
- **Use the \`Path\` enum** — all route paths come from \`src/router/paths.ts\`. Never hardcode path strings like \`'/login'\` or \`'/dashboard'\`
- **Add new paths to the enum** — when creating a new page, add its path to the \`Path\` enum before the \`// blacksmith:path\` marker

### Environment
- Backend: \`http://localhost:8000\`
- Frontend: \`http://localhost:5173\`
- API docs: \`http://localhost:8000/api/docs/\` (Swagger UI) or \`/api/redoc/\` (ReDoc)
- Python venv: \`backend/venv/\` — always use \`./venv/bin/python\` or \`./venv/bin/pip\`
- Start everything: \`blacksmith dev\`

### Checklist Before Finishing a Task
1. Backend tests pass: \`cd backend && ./venv/bin/python manage.py test\`
2. Frontend tests pass: \`cd frontend && npm test\`
3. Frontend builds: \`cd frontend && npm run build\`
4. API types are in sync: \`blacksmith sync\`
5. No lint errors in modified files
6. All UI uses \`@blacksmith-ui/react\` components — no raw \`<div>\` for layout, no raw \`<h1>\`-\`<h6>\` for text
7. Pages are modular — page file is a thin orchestrator, sections are in \`components/\`, logic in \`hooks/\`
8. Logic is in hooks — no \`useApiQuery\`, \`useApiMutation\`, \`useEffect\`, or multi-\`useState\` in component bodies
9. No hardcoded route paths — all paths use the \`Path\` enum from \`@/router/paths\`
10. New routes have a corresponding \`Path\` enum entry
11. **Tests are co-located** — every new or modified page, component, or hook has a corresponding \`.spec.tsx\` / \`.spec.ts\` in a \`__tests__/\` folder next to the source file (see the \`frontend-testing\` skill)
`
  },
}
