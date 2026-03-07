import fs from 'node:fs'
import { findProjectRoot, loadConfig } from '../utils/paths.js'
import { setupAiDev } from './ai-setup.js'
import { log } from '../utils/logger.js'

import { projectOverviewSkill } from '../skills/project-overview.js'
import { djangoSkill } from '../skills/django.js'
import { djangoRestAdvancedSkill } from '../skills/django-rest-advanced.js'
import { apiDocumentationSkill } from '../skills/api-documentation.js'
import { reactSkill } from '../skills/react.js'
import { blacksmithUiReactSkill } from '../skills/blacksmith-ui-react.js'
import { blacksmithUiFormsSkill } from '../skills/blacksmith-ui-forms.js'
import { blacksmithUiAuthSkill } from '../skills/blacksmith-ui-auth.js'
import { blacksmithHooksSkill } from '../skills/blacksmith-hooks.js'
import { blacksmithCliSkill } from '../skills/blacksmith-cli.js'
import { cleanCodeSkill } from '../skills/clean-code.js'
import { aiGuidelinesSkill } from '../skills/ai-guidelines.js'
import type { Skill } from '../skills/types.js'

const allSkills: Skill[] = [
  projectOverviewSkill,
  djangoSkill,
  djangoRestAdvancedSkill,
  apiDocumentationSkill,
  reactSkill,
  blacksmithUiReactSkill,
  blacksmithUiFormsSkill,
  blacksmithUiAuthSkill,
  blacksmithHooksSkill,
  blacksmithCliSkill,
  cleanCodeSkill,
  aiGuidelinesSkill,
]

interface SetupOptions {
  blacksmithUiSkill?: boolean
}

export async function setupSkills(options: SetupOptions) {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const config = loadConfig(root)

  await setupAiDev({
    projectDir: root,
    projectName: config.name,
    includeBlacksmithUiSkill: options.blacksmithUiSkill !== false,
  })

  log.blank()
  log.success('AI skills generated:')
  log.step('  CLAUDE.md                  → project overview + guidelines')
  log.step('  .claude/skills/*.md        → detailed skill files')
}

export function listSkills() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const hasClaude = fs.existsSync(`${root}/CLAUDE.md`)
  const hasSkillsDir = fs.existsSync(`${root}/.claude/skills`)

  const inlineSkills = allSkills.filter((s) => !s.filename)
  const fileSkills = allSkills.filter((s) => s.filename)

  log.info('Inline skills (in CLAUDE.md):')
  for (const skill of inlineSkills) {
    log.step(`  ${skill.id}`)
  }

  log.blank()
  log.info('File-based skills (in .claude/skills/):')
  for (const skill of fileSkills) {
    const exists = hasSkillsDir && fs.existsSync(`${root}/.claude/skills/${skill.filename}`)
    const status = exists ? '✓' : '✗'
    log.step(`  ${status} ${skill.filename}`)
  }

  log.blank()
  if (hasClaude && hasSkillsDir) {
    log.success('AI skills are set up. Run "blacksmith setup:ai" to regenerate.')
  } else {
    log.info('Run "blacksmith setup:ai" to generate AI skills.')
  }
}
