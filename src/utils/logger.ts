import chalk from 'chalk'
import ora, { type Ora } from 'ora'
import { createInterface } from 'node:readline'
import { BACKEND_TOOLCHAINS } from './backend-toolchains.js'
import { FRONTEND_TOOLCHAINS } from './frontend-toolchains.js'
import type { BackendFramework, FrontendFramework } from './paths.js'

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

export function promptSelect(label: string, options: string[], defaultValue?: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const optionList = options.map((opt, i) => `${chalk.dim(`  ${i + 1}.`)} ${opt}`).join('\n')
  const def = defaultValue ? chalk.dim(` (${defaultValue})`) : ''
  const question = `  ${chalk.cyan('?')} ${chalk.bold(label)}${def}\n${optionList}\n  ${chalk.dim('Choice:')} `
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      const trimmed = answer.trim()
      if (!trimmed && defaultValue) return resolve(defaultValue)
      const index = parseInt(trimmed, 10)
      if (index >= 1 && index <= options.length) return resolve(options[index - 1])
      const match = options.find((opt) => opt.toLowerCase() === trimmed.toLowerCase())
      resolve(match || defaultValue || options[0])
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

export function printNextSteps(
  projectName: string,
  projectType: string = 'fullstack',
  backendPort?: number,
  frontendPort?: number,
  backendFramework: BackendFramework = 'django',
  frontendFramework: FrontendFramework = 'react'
) {
  log.blank()
  log.success('Project created successfully!')
  log.blank()
  console.log(chalk.bold('  Next steps:'))
  console.log()
  console.log(`  ${chalk.cyan('cd')} ${projectName}`)
  console.log(`  ${chalk.cyan('blacksmith dev')}        ${chalk.dim('# Start development server' + (projectType === 'fullstack' ? 's' : ''))}`)
  console.log()

  // One column for every URL, as wide as the longest label shown
  const toolchain = backendPort !== undefined ? BACKEND_TOOLCHAINS[backendFramework] : null
  const width = Math.max(8, (toolchain?.label.length ?? 0) + 1)
  const url = (label: string, address: string) =>
    console.log(chalk.dim(`  ${`${label}:`.padEnd(width)}  ${address}`))

  if (toolchain) {
    url(toolchain.label, `http://localhost:${backendPort}`)
    url('Swagger', `http://localhost:${backendPort}/api/docs/`)
    if (toolchain.redoc) url('ReDoc', `http://localhost:${backendPort}/api/redoc/`)
  }

  if (frontendPort !== undefined) {
    url(FRONTEND_TOOLCHAINS[frontendFramework].label, `http://localhost:${frontendPort}`)
  }

  log.blank()
}
