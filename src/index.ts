import { Command } from 'commander'
import { banner } from './utils/logger.js'
import { init } from './commands/init.js'
import { dev } from './commands/dev.js'
import { sync } from './commands/sync.js'
import { makeResource } from './commands/make-resource.js'
import { build } from './commands/build.js'
import { eject } from './commands/eject.js'
import { setupSkills, listSkills } from './commands/skills.js'
import { setupMcp } from './commands/mcp-setup.js'
import { backend } from './commands/backend.js'
import { frontend } from './commands/frontend.js'
import { setupBackend, setupBackendPython, setupBackendVenv, setupBackendDeps } from './commands/setup-backend.js'
import { setupFrontend, setupFrontendNode, setupFrontendDeps } from './commands/setup-frontend.js'
import { setup } from './commands/setup.js'

const program = new Command()

program
  .name('blacksmith')
  .description('Fullstack Django + React framework')
  .version('0.1.0')
  .hook('preAction', () => {
    banner()
  })

program
  .command('init')
  .argument('[name]', 'Project name')
  .option('--type <type>', 'Project type: fullstack, backend, or frontend (default: fullstack)')
  .option('--ai', 'Set up AI development skills and documentation (CLAUDE.md)')
  .option('--no-chakra-ui-skill', 'Disable Chakra UI skill when using --ai')
  .option('-b, --backend-port <port>', 'Django backend port (default: 8000)')
  .option('-f, --frontend-port <port>', 'Vite frontend port (default: 5173)')
  .option('-t, --theme-color <color>', 'Theme color (zinc, slate, blue, green, orange, red, violet)')
  .description('Create a new Blacksmith project')
  .action(init)

program
  .command('dev')
  .description('Start development servers (Django + Vite + OpenAPI sync)')
  .action(dev)

program
  .command('sync')
  .description('Sync OpenAPI schema to frontend types, schemas, and hooks')
  .action(sync)

program
  .command('make:resource')
  .argument('<name>', 'Resource name (PascalCase, e.g. BlogPost)')
  .description('Create a new resource (model, serializer, viewset, hooks, pages)')
  .action(makeResource)

program
  .command('build')
  .description('Build both frontend and backend for production')
  .action(build)

program
  .command('eject')
  .description('Remove Blacksmith, keep a clean Django + React project')
  .action(eject)

program
  .command('setup:ai')
  .description('Generate CLAUDE.md with AI development skills for the project')
  .option('--no-chakra-ui-skill', 'Exclude Chakra UI skill')
  .action(setupSkills)

program
  .command('setup:mcp')
  .description('Configure MCP servers for Claude Code AI integration')
  .action(setupMcp)

program
  .command('setup')
  .description('Set up the entire project (backend + frontend)')
  .action(setup)

// Backend setup commands
const setupBackendCmd = program
  .command('setup:backend')
  .description('Set up the backend project (install Python, create venv, install deps)')
  .action(setupBackend)

setupBackendCmd
  .command('python')
  .description('Install Python 3 if not already installed')
  .action(setupBackendPython)

setupBackendCmd
  .command('venv')
  .description('Create a Python virtual environment')
  .action(setupBackendVenv)

setupBackendCmd
  .command('deps')
  .description('Install Python dependencies and run migrations')
  .action(setupBackendDeps)

// Frontend setup commands
const setupFrontendCmd = program
  .command('setup:frontend')
  .description('Set up the frontend project (install Node.js, install deps)')
  .action(setupFrontend)

setupFrontendCmd
  .command('node')
  .description('Install Node.js and npm if not already installed')
  .action(setupFrontendNode)

setupFrontendCmd
  .command('deps')
  .description('Install Node.js dependencies')
  .action(setupFrontendDeps)

program
  .command('skills')
  .description('List all available AI development skills')
  .action(listSkills)

program
  .command('backend')
  .argument('[args...]', 'Django management command and arguments')
  .description('Run a Django management command (e.g. blacksmith backend createsuperuser)')
  .allowUnknownOption()
  .action(backend)

program
  .command('frontend')
  .argument('[args...]', 'npm command and arguments')
  .description('Run an npm command in the frontend (e.g. blacksmith frontend install axios)')
  .allowUnknownOption()
  .action(frontend)

program.parse()
