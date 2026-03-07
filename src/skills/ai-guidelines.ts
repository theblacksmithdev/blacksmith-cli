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

### Environment
- Backend: \`http://localhost:8000\`
- Frontend: \`http://localhost:5173\`
- API docs: \`http://localhost:8000/api/docs/\` (Swagger UI) or \`/api/redoc/\` (ReDoc)
- Python venv: \`backend/venv/\` — always use \`./venv/bin/python\` or \`./venv/bin/pip\`
- Start everything: \`blacksmith dev\`

### Checklist Before Finishing a Task
1. Backend tests pass: \`cd backend && ./venv/bin/python manage.py test\`
2. Frontend builds: \`cd frontend && npm run build\`
3. API types are in sync: \`blacksmith sync\`
4. No lint errors in modified files
`
  },
}
