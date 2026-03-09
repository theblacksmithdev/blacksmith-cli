import { vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// ──────────────────────────────────────────────
// Reusable mock factory for vi.mock() calls
// ──────────────────────────────────────────────

/** Standard logger mock — covers log.*, spinner(), and prompt helpers */
export function createLoggerMock() {
  return {
    log: {
      info: vi.fn(),
      success: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      step: vi.fn(),
      blank: vi.fn(),
    },
    spinner: vi.fn(() => ({
      succeed: vi.fn(),
      fail: vi.fn(),
      warn: vi.fn(),
    })),
    printNextSteps: vi.fn(),
    promptText: vi.fn(),
    promptYesNo: vi.fn(),
    promptSelect: vi.fn(),
    printConfig: vi.fn(),
    banner: vi.fn(),
  }
}

// ──────────────────────────────────────────────
// Temp directory helper
// ──────────────────────────────────────────────

/**
 * Creates a temporary directory for each test and cleans up after.
 * Returns a getter function since the dir is recreated per test.
 *
 * Usage:
 *   const getTmpDir = useTmpDir()
 *   it('should ...', () => { const dir = getTmpDir(); ... })
 */
export function useTmpDir() {
  let tmpDir = ''

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  return () => tmpDir
}
