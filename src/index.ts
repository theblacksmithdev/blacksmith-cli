import { Command } from 'commander'
import { banner } from './utils/logger.js'
import { init } from './commands/init.js'
import { dev } from './commands/dev.js'
import { sync } from './commands/sync.js'
import { makeResource } from './commands/make-resource.js'
import { build } from './commands/build.js'
import { eject } from './commands/eject.js'

const program = new Command()

program
  .name('forge')
  .description('Fullstack Django + React framework')
  .version('0.1.0')
  .hook('preAction', () => {
    banner()
  })

program
  .command('init')
  .argument('<name>', 'Project name')
  .description('Create a new Forge project')
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
  .description('Remove Forge, keep a clean Django + React project')
  .action(eject)

program.parse()
