import chalk from 'chalk'
import ora, { type Ora } from 'ora'
import { createInterface } from 'node:readline'

export const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  step: (msg: string) => console.log(chalk.cyan('→'), msg),
  blank: () => console.log(),
}

export function promptText(label: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const def = defaultValue ? chalk.dim(` (${defaultValue})`) : ''
  const question = `  ${chalk.cyan('?')} ${chalk.bold(label)}${def}${chalk.dim(':')} `
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim() || defaultValue || '')
    })
  })
}

export function promptYesNo(label: string, defaultValue = false): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const hint = defaultValue ? chalk.dim(' (Y/n)') : chalk.dim(' (y/N)')
  const question = `  ${chalk.cyan('?')} ${chalk.bold(label)}${hint}${chalk.dim(':')} `
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      const val = answer.trim().toLowerCase()
      if (!val) return resolve(defaultValue)
      resolve(['y', 'yes'].includes(val))
    })
  })
}

export function printConfig(config: Record<string, string>) {
  const bar = chalk.dim('│')
  console.log()
  console.log(`  ${chalk.dim('┌──────────────────────────────────────┐')}`)
  console.log(`  ${bar}  ${chalk.bold.white('Configuration')}${' '.repeat(23)}${bar}`)
  console.log(`  ${chalk.dim('├──────────────────────────────────────┤')}`)
  for (const [key, value] of Object.entries(config)) {
    const padded = `${chalk.dim(key + ':')} ${chalk.white(value)}`
    const rawLen = `${key}: ${value}`.length
    const padding = ' '.repeat(Math.max(1, 36 - rawLen))
    console.log(`  ${bar}  ${padded}${padding}${bar}`)
  }
  console.log(`  ${chalk.dim('└──────────────────────────────────────┘')}`)
  console.log()
}

export function spinner(text: string): Ora {
  return ora({ text, color: 'cyan' }).start()
}

export function banner() {
  const logo = [
    '  ██████╗ ██╗      █████╗  ██████╗██╗  ██╗',
    '  ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝',
    '  ██████╔╝██║     ███████║██║     █████╔╝ ',
    '  ██╔══██╗██║     ██╔══██║██║     ██╔═██╗ ',
    '  ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗',
    '  ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝',
    '  ███████╗███╗   ███╗██╗████████╗██╗  ██╗',
    '  ██╔════╝████╗ ████║██║╚══██╔══╝██║  ██║',
    '  ███████╗██╔████╔██║██║   ██║   ███████║',
    '  ╚════██║██║╚██╔╝██║██║   ██║   ██╔══██║',
    '  ███████║██║ ╚═╝ ██║██║   ██║   ██║  ██║',
    '  ╚══════╝╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝',
  ]

  console.log()
  for (const line of logo) {
    console.log(chalk.cyan(line))
  }
  console.log()
  console.log(chalk.dim('  Welcome to Blacksmith — forge fullstack apps with one command.'))
  console.log()
}

export function printNextSteps(projectName: string, backendPort = 8000, frontendPort = 5173) {
  log.blank()
  log.success('Project created successfully!')
  log.blank()
  console.log(chalk.bold('  Next steps:'))
  console.log()
  console.log(`  ${chalk.cyan('cd')} ${projectName}`)
  console.log(`  ${chalk.cyan('blacksmith dev')}        ${chalk.dim('# Start development servers')}`)
  console.log()
  console.log(chalk.dim(`  Django:   http://localhost:${backendPort}`))
  console.log(chalk.dim(`  React:    http://localhost:${frontendPort}`))
  console.log(chalk.dim(`  Swagger:  http://localhost:${backendPort}/api/docs/`))
  console.log(chalk.dim(`  ReDoc:    http://localhost:${backendPort}/api/redoc/`))
  log.blank()
}
