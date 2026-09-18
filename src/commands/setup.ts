import { findProjectRoot, getBackendFramework, getProjectType, hasBackend, hasFrontend, loadConfig } from '../utils/paths.js'
import { ensureGitignore } from '../utils/gitignore.js'
import { ensureCiWorkflow, projectLayout } from '../utils/scaffold.js'
import { log } from '../utils/logger.js'
import { setupBackend } from './setup-backend.js'
import { setupFrontend } from './setup-frontend.js'

export async function setup() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const needsBackend = hasBackend(root)
  const needsFrontend = hasFrontend(root)
  const projectType = getProjectType(root)

  // Fullstack projects keep a root .gitignore; backend/frontend-only projects
  // are covered by the .gitignore the sub-setup writes into the project root.
  if (projectType === 'fullstack' && ensureGitignore(root, 'project')) {
    log.step('Added .gitignore')
  }

  // Projects generated before CI shipped pick the workflow up here
  const ciContext = {
    projectName: loadConfig(root).name,
    ...projectLayout(projectType, getBackendFramework(root)),
  }
  if (ensureCiWorkflow(root, ciContext)) {
    log.step('Added .github/workflows/ci.yml')
  }

  if (needsBackend) {
    await setupBackend()
    log.blank()
  }

  if (needsFrontend) {
    await setupFrontend()
    log.blank()
  }

  log.success('Project setup complete! Run "blacksmith dev" to start developing.')
}
