import type { Skill, SkillContext } from './types.js'
import { backendProfile } from './backend-profiles.js'
import { frontendProfile } from './frontend-profiles.js'

export const programmingParadigmsSkill: Skill = {
  id: 'programming-paradigms',
  name: 'Programming Paradigms',
  description: 'Functional programming for the frontend, and the paradigm the backend framework calls for.',

  render(ctx: SkillContext): string {
    const backend = backendProfile(ctx)
    const frontend = frontendProfile(ctx)

    return `## Programming Paradigms

> ${frontend.paradigmSummary}
> ${backend.paradigmSummary}

---

${frontend.paradigms}
---

${backend.paradigms}
`
  },
}
