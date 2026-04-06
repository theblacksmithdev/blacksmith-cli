import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createLoggerMock, useTmpDir } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  loadConfig: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

import { setupMcp } from '../mcp-setup.js'
import { log, promptSelect, promptText, promptYesNo } from '../../utils/logger.js'

describe('setupMcp', () => {
  const getTmpDir = useTmpDir()

  function setupProjectRoot() {
    const root = getTmpDir()
    pathMocks.findProjectRoot.mockReturnValue(root)
    fs.mkdirSync(path.join(root, '.claude'), { recursive: true })
    return root
  }

  it('should exit with error when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(setupMcp()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining('Not inside a Blacksmith project'),
    )
  })

  it('should create settings file with MCP server when none exists', async () => {
    const root = setupProjectRoot()

    // Select Fetch (no prompts needed), then Done
    vi.mocked(promptSelect)
      .mockResolvedValueOnce('Fetch — Make HTTP requests and fetch web content')
      .mockResolvedValueOnce('Done — save and exit')

    await setupMcp()

    const settingsPath = path.join(root, '.claude', 'settings.local.json')
    expect(fs.existsSync(settingsPath)).toBe(true)

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    expect(settings.mcpServers.fetch).toBeDefined()
    expect(settings.mcpServers.fetch.command).toBe('npx')
    expect(settings.mcpServers.fetch.args).toContain('@modelcontextprotocol/server-fetch')
  })

  it('should preserve existing permissions when writing mcpServers', async () => {
    const root = setupProjectRoot()
    const settingsPath = path.join(root, '.claude', 'settings.local.json')

    const existingSettings = {
      permissions: { allow: ['Bash(npm test)'] },
    }
    fs.writeFileSync(settingsPath, JSON.stringify(existingSettings))

    vi.mocked(promptSelect)
      .mockResolvedValueOnce('Fetch — Make HTTP requests and fetch web content')
      .mockResolvedValueOnce('Done — save and exit')

    await setupMcp()

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    expect(settings.permissions).toEqual({ allow: ['Bash(npm test)'] })
    expect(settings.mcpServers.fetch).toBeDefined()
  })

  it('should merge new servers with existing mcpServers', async () => {
    const root = setupProjectRoot()
    const settingsPath = path.join(root, '.claude', 'settings.local.json')

    const existingSettings = {
      mcpServers: {
        'custom-server': { command: 'node', args: ['server.js'] },
      },
    }
    fs.writeFileSync(settingsPath, JSON.stringify(existingSettings))

    vi.mocked(promptSelect)
      .mockResolvedValueOnce('Fetch — Make HTTP requests and fetch web content')
      .mockResolvedValueOnce('Done — save and exit')

    await setupMcp()

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    expect(settings.mcpServers['custom-server']).toBeDefined()
    expect(settings.mcpServers.fetch).toBeDefined()
  })

  it('should prompt for config and add args for filesystem server', async () => {
    const root = setupProjectRoot()

    vi.mocked(promptSelect)
      .mockResolvedValueOnce('Filesystem — Read and write project files')
      .mockResolvedValueOnce('Done — save and exit')
    vi.mocked(promptText).mockResolvedValueOnce('/home/user/project')

    await setupMcp()

    const settingsPath = path.join(root, '.claude', 'settings.local.json')
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    expect(settings.mcpServers.filesystem.args).toContain('/home/user/project')
  })

  it('should set env vars for github server', async () => {
    const root = setupProjectRoot()

    vi.mocked(promptSelect)
      .mockResolvedValueOnce('GitHub — Interact with GitHub repos, issues, and PRs')
      .mockResolvedValueOnce('Done — save and exit')
    vi.mocked(promptText).mockResolvedValueOnce('ghp_testtoken123')

    await setupMcp()

    const settingsPath = path.join(root, '.claude', 'settings.local.json')
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    expect(settings.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN).toBe('ghp_testtoken123')
  })

  it('should skip server when required prompt is empty', async () => {
    const root = setupProjectRoot()

    vi.mocked(promptSelect)
      .mockResolvedValueOnce('PostgreSQL — Query PostgreSQL databases')
      .mockResolvedValueOnce('Done — save and exit')
    vi.mocked(promptText).mockResolvedValueOnce('')

    await setupMcp()

    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('Skipping PostgreSQL'))
    expect(log.info).toHaveBeenCalledWith('No new servers configured.')
  })

  it('should ask to overwrite when server is already configured', async () => {
    const root = setupProjectRoot()
    const settingsPath = path.join(root, '.claude', 'settings.local.json')

    const existingSettings = {
      mcpServers: {
        fetch: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-fetch'] },
      },
    }
    fs.writeFileSync(settingsPath, JSON.stringify(existingSettings))

    vi.mocked(promptSelect)
      .mockResolvedValueOnce('Fetch — Make HTTP requests and fetch web content (configured)')
      .mockResolvedValueOnce('Done — save and exit')
    vi.mocked(promptYesNo).mockResolvedValueOnce(false)

    await setupMcp()

    expect(promptYesNo).toHaveBeenCalledWith(
      expect.stringContaining('already configured'),
      false,
    )
    expect(log.info).toHaveBeenCalledWith('No new servers configured.')
  })

  it('should configure chakra-ui-docs without prompts', async () => {
    const root = setupProjectRoot()

    vi.mocked(promptSelect)
      .mockResolvedValueOnce('Chakra UI Docs — Chakra UI component documentation for AI assistance')
      .mockResolvedValueOnce('Done — save and exit')

    await setupMcp()

    const settingsPath = path.join(root, '.claude', 'settings.local.json')
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    expect(settings.mcpServers['chakra-ui-docs']).toBeDefined()
    expect(settings.mcpServers['chakra-ui-docs'].args).toContain('@anthropic-ai/mcp-docs-server')
    expect(settings.mcpServers['chakra-ui-docs'].args).toContain('https://www.chakra-ui.com/docs')
  })

  it('should configure multiple servers in one session', async () => {
    const root = setupProjectRoot()

    vi.mocked(promptSelect)
      .mockResolvedValueOnce('Fetch — Make HTTP requests and fetch web content')
      .mockResolvedValueOnce('Chakra UI Docs — Chakra UI component documentation for AI assistance')
      .mockResolvedValueOnce('Done — save and exit')

    await setupMcp()

    const settingsPath = path.join(root, '.claude', 'settings.local.json')
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    expect(settings.mcpServers.fetch).toBeDefined()
    expect(settings.mcpServers['chakra-ui-docs']).toBeDefined()
    expect(log.success).toHaveBeenCalledWith('MCP servers configured:')
  })
})
