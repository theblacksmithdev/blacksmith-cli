import path from 'node:path'
import fs from 'node:fs'
import { log, spinner } from '../utils/logger.js'
import type { Skill, SkillContext } from '../skills/types.js'
import { projectOverviewSkill } from '../skills/project-overview.js'
import { djangoSkill } from '../skills/django.js'
import { djangoRestAdvancedSkill } from '../skills/django-rest-advanced.js'
import { apiDocumentationSkill } from '../skills/api-documentation.js'
import { reactSkill } from '../skills/react.js'
import { reactQuerySkill } from '../skills/react-query.js'
import { blacksmithUiReactSkill } from '../skills/blacksmith-ui-react.js'
import { blacksmithUiFormsSkill } from '../skills/blacksmith-ui-forms.js'
import { blacksmithUiAuthSkill } from '../skills/blacksmith-ui-auth.js'
import { blacksmithHooksSkill } from '../skills/blacksmith-hooks.js'
import { blacksmithCliSkill } from '../skills/blacksmith-cli.js'
import { cleanCodeSkill } from '../skills/clean-code.js'
import { aiGuidelinesSkill } from '../skills/ai-guidelines.js'

interface AiSetupOptions {
  projectDir: string
  projectName: string
  includeBlacksmithUiSkill: boolean
}

export async function setupAiDev({ projectDir, projectName, includeBlacksmithUiSkill }: AiSetupOptions) {
  const aiSpinner = spinner('Setting up AI development environment...')

  try {
    const skills: Skill[] = [
      projectOverviewSkill,
      djangoSkill,
      djangoRestAdvancedSkill,
      apiDocumentationSkill,
      reactSkill,
      reactQuerySkill,
    ]

    if (includeBlacksmithUiSkill) {
      skills.push(blacksmithUiReactSkill)
      skills.push(blacksmithUiFormsSkill)
      skills.push(blacksmithUiAuthSkill)
      skills.push(blacksmithHooksSkill)
    }

    skills.push(blacksmithCliSkill)
    skills.push(cleanCodeSkill)
    skills.push(aiGuidelinesSkill)

    const ctx: SkillContext = { projectName }

    // Separate inline skills (CLAUDE.md) from file-based skills (.claude/skills/)
    const inlineSkills = skills.filter((s) => !s.filename)
    const fileSkills = skills.filter((s) => s.filename)

    // Create .claude/skills/ directory (clean existing files first)
    const skillsDir = path.join(projectDir, '.claude', 'skills')
    if (fs.existsSync(skillsDir)) {
      for (const file of fs.readdirSync(skillsDir)) {
        if (file.endsWith('.md')) {
          fs.unlinkSync(path.join(skillsDir, file))
        }
      }
    }
    fs.mkdirSync(skillsDir, { recursive: true })

    // Write each file-based skill to its own .md file
    for (const skill of fileSkills) {
      const content = skill.render(ctx).trim()
      fs.writeFileSync(path.join(skillsDir, skill.filename!), content + '\n', 'utf-8')
    }

    // Build CLAUDE.md with inline content + skills directory reference
    const inlineContent = inlineSkills.map((s) => s.render(ctx)).join('\n')
    const skillsList = fileSkills.map((s) => `- \`.claude/skills/${s.filename}\` — ${s.id}`).join('\n')

    const claudeMd = [
      inlineContent.trim(),
      '',
      '## AI Skills',
      '',
      'Detailed skills and conventions are in `.claude/skills/`:',
      '',
      skillsList,
      '',
      'These files are auto-loaded by Claude Code. Run `blacksmith setup:ai` to regenerate.',
      '',
    ].join('\n')

    fs.writeFileSync(path.join(projectDir, 'CLAUDE.md'), claudeMd, 'utf-8')

    const skillNames = skills
      .filter((s) => s.id !== 'project-overview' && s.id !== 'ai-guidelines')
      .map((s) => s.id)
      .join(' + ')

    aiSpinner.succeed(`AI dev environment ready (${skillNames} skills)`)
  } catch (error: any) {
    aiSpinner.fail('Failed to set up AI development environment')
    log.error(error.message)
  }
}
