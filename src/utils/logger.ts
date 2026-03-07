import chalk from 'chalk'
import ora, { type Ora } from 'ora'

export const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  step: (msg: string) => console.log(chalk.cyan('→'), msg),
  blank: () => console.log(),
}

export function spinner(text: string): Ora {
  return ora({ text, color: 'cyan' }).start()
}

export function banner() {
  console.log()
  console.log(chalk.bold.cyan('  ⚒  Blacksmith'))
  console.log(chalk.dim('  Fullstack Django + React'))
  console.log()
}

export function printNextSteps(projectName: string) {
  log.blank()
  log.success('Project created successfully!')
  log.blank()
  console.log(chalk.bold('  Next steps:'))
  console.log()
  console.log(`  ${chalk.cyan('cd')} ${projectName}`)
  console.log(`  ${chalk.cyan('blacksmith dev')}        ${chalk.dim('# Start development servers')}`)
  console.log()
  console.log(chalk.dim('  Django:   http://localhost:8000'))
  console.log(chalk.dim('  React:    http://localhost:5173'))
  console.log(chalk.dim('  Swagger:  http://localhost:8000/api/docs/'))
  console.log(chalk.dim('  ReDoc:    http://localhost:8000/api/redoc/'))
  log.blank()
}
