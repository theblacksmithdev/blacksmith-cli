import fs from 'node:fs'
import { findProjectRoot, loadConfig, getBackendFramework, getProjectType } from '../utils/paths.js'
import { setupAiDev } from './ai-setup.js'
import { log } from '../utils/logger.js'
import { selectSkills } from '../skills/selection.js'

interface SetupOptions {
  chakraUiSkill?: boolean
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
    includeChakraUiSkill: options.chakraUiSkill !== false,
    projectType: getProjectType(root),
    backendFramework: getBackendFramework(root),
  })

  log.blank()
  log.success('AI skills generated:')
  log.step('  CLAUDE.md                  → project overview + guidelines')
  log.step('  .claude/skills/*/SKILL.md  → detailed skill files')
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

  // Chakra UI skills are listed as expected; `setup:ai --no-chakra-ui-skill`
  // leaves them unwritten, which shows as ✗ below.
  const skills = selectSkills({
    projectType: getProjectType(root),
    backendFramework: getBackendFramework(root),
    includeChakraUiSkill: true,
  })
  const inlineSkills = skills.filter((s) => !s.name)
  const fileSkills = skills.filter((s) => s.name)

  log.info('Inline skills (in CLAUDE.md):')
  for (const skill of inlineSkills) {
    log.step(`  ${skill.id}`)
  }

  log.blank()
  log.info('File-based skills (in .claude/skills/):')
  for (const skill of fileSkills) {
    const exists = hasSkillsDir && fs.existsSync(`${root}/.claude/skills/${skill.id}/SKILL.md`)
    const status = exists ? '✓' : '✗'
    log.step(`  ${status} ${skill.id}/SKILL.md — ${skill.name}`)
  }

  log.blank()
  if (hasClaude && hasSkillsDir) {
    log.success('AI skills are set up. Run "blacksmith setup:ai" to regenerate.')
  } else {
    log.info('Run "blacksmith setup:ai" to generate AI skills.')
  }
}
