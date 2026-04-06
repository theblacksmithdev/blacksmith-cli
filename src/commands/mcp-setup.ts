import fs from 'node:fs'
import path from 'node:path'
import { findProjectRoot } from '../utils/paths.js'
import { log, promptSelect, promptText, promptYesNo } from '../utils/logger.js'

interface McpPrompt {
  label: string
  defaultValue?: string
  target: 'args' | 'env'
  envVar?: string
}

interface McpServerPreset {
  id: string
  name: string
  description: string
  command: string
  args: string[]
  env?: Record<string, string>
  prompts?: McpPrompt[]
}

interface McpServerConfig {
  command: string
  args: string[]
  env?: Record<string, string>
}

const DONE_OPTION = 'Done — save and exit'

function getPresets(projectRoot: string): McpServerPreset[] {
  return [
    {
      id: 'filesystem',
      name: 'Filesystem',
      description: 'Read and write project files',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem'],
      prompts: [
        {
          label: 'Allowed directory path',
          defaultValue: projectRoot,
          target: 'args',
        },
      ],
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      description: 'Query PostgreSQL databases',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      prompts: [
        {
          label: 'PostgreSQL connection string (e.g. postgresql://user:pass@localhost:5432/dbname)',
          target: 'args',
        },
      ],
    },
    {
      id: 'fetch',
      name: 'Fetch',
      description: 'Make HTTP requests and fetch web content',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch'],
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Interact with GitHub repos, issues, and PRs',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      prompts: [
        {
          label: 'GitHub personal access token',
          target: 'env',
          envVar: 'GITHUB_PERSONAL_ACCESS_TOKEN',
        },
      ],
    },
    {
      id: 'chakra-ui-docs',
      name: 'Chakra UI Docs',
      description: 'Chakra UI component documentation for AI assistance',
      command: 'npx',
      args: [
        '-y',
        '@anthropic-ai/mcp-docs-server',
        '--url',
        'https://www.chakra-ui.com/docs',
        '--name',
        'chakra-ui-docs',
      ],
    },
    {
      id: 'sentry',
      name: 'Sentry',
      description: 'Query errors, view issues, and manage releases in Sentry',
      command: 'npx',
      args: ['-y', '@sentry/mcp-server'],
      prompts: [
        {
          label: 'Sentry auth token',
          target: 'env',
          envVar: 'SENTRY_AUTH_TOKEN',
        },
        {
          label: 'Sentry organization slug',
          target: 'env',
          envVar: 'SENTRY_ORG',
        },
      ],
    },
    {
      id: 'puppeteer',
      name: 'Puppeteer',
      description: 'Browser automation for testing, screenshots, and scraping',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    },
    {
      id: 'memory',
      name: 'Memory',
      description: 'Persistent knowledge graph for cross-session context',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Read/send messages, search channels, and manage threads',
      command: 'npx',
      args: ['-y', '@anthropic-ai/mcp-server-slack'],
      prompts: [
        {
          label: 'Slack bot token (xoxb-...)',
          target: 'env',
          envVar: 'SLACK_BOT_TOKEN',
        },
        {
          label: 'Slack team ID',
          target: 'env',
          envVar: 'SLACK_TEAM_ID',
        },
      ],
    },
    {
      id: 'redis',
      name: 'Redis',
      description: 'Query and manage Redis cache',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-redis'],
      prompts: [
        {
          label: 'Redis URL (e.g. redis://localhost:6379)',
          defaultValue: 'redis://localhost:6379',
          target: 'env',
          envVar: 'REDIS_URL',
        },
      ],
    },
  ]
}

function readSettings(settingsPath: string): Record<string, any> {
  if (!fs.existsSync(settingsPath)) {
    return {}
  }

  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  } catch {
    return {}
  }
}

function buildServerConfig(preset: McpServerPreset, promptValues: string[]): McpServerConfig {
  const args = [...preset.args]
  const env: Record<string, string> = { ...preset.env }

  let valueIndex = 0
  for (const prompt of preset.prompts || []) {
    const value = promptValues[valueIndex++]
    if (prompt.target === 'args') {
      args.push(value)
    } else if (prompt.target === 'env' && prompt.envVar) {
      env[prompt.envVar] = value
    }
  }

  const config: McpServerConfig = { command: preset.command, args }
  if (Object.keys(env).length > 0) {
    config.env = env
  }
  return config
}

export async function setupMcp() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const settingsPath = path.join(root, '.claude', 'settings.local.json')
  const settings = readSettings(settingsPath)
  const existingServers: Record<string, any> = settings.mcpServers || {}
  const newServers: Record<string, McpServerConfig> = {}
  const presets = getPresets(root)

  log.blank()
  log.info('Configure MCP servers for Claude Code.')
  log.info('Select servers to add, then choose "Done" to save.')
  log.blank()

  while (true) {
    const options = presets.map((p) => {
      const configured = existingServers[p.id] || newServers[p.id]
      const suffix = configured ? ' (configured)' : ''
      return `${p.name} — ${p.description}${suffix}`
    })
    options.push(DONE_OPTION)

    const choice = await promptSelect('Select an MCP server to configure', options)

    if (choice === DONE_OPTION) {
      break
    }

    const selectedIndex = options.indexOf(choice)
    const preset = presets[selectedIndex]

    if (!preset) break

    // Check if already configured
    if (existingServers[preset.id] || newServers[preset.id]) {
      const overwrite = await promptYesNo(
        `${preset.name} is already configured. Overwrite?`,
        false,
      )
      if (!overwrite) continue
    }

    // Collect prompt values
    const values: string[] = []
    let skipped = false

    for (const prompt of preset.prompts || []) {
      const value = await promptText(prompt.label, prompt.defaultValue)
      if (!value && !prompt.defaultValue) {
        log.warn(`Skipping ${preset.name} — required value not provided.`)
        skipped = true
        break
      }
      values.push(value)
    }

    if (skipped) continue

    newServers[preset.id] = buildServerConfig(preset, values)
    log.success(`${preset.name} configured.`)
    log.blank()
  }

  if (Object.keys(newServers).length === 0) {
    log.info('No new servers configured.')
    return
  }

  // Merge and write
  settings.mcpServers = { ...existingServers, ...newServers }

  try {
    fs.mkdirSync(path.join(root, '.claude'), { recursive: true })
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8')
  } catch (error: any) {
    log.error(`Failed to write settings: ${error.message}`)
    process.exit(1)
  }

  log.blank()
  log.success('MCP servers configured:')
  for (const id of Object.keys(newServers)) {
    const preset = presets.find((p) => p.id === id)
    log.step(`  ${preset?.name || id}`)
  }
  log.blank()
  log.info(`Settings written to ${path.relative(root, settingsPath)}`)
  log.blank()
}
