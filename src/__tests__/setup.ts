import { vi, beforeEach } from 'vitest'

// Automatically clear all mocks before each test across all test files
beforeEach(() => {
  vi.clearAllMocks()
})

// Mock process.exit globally — throws so we can assert on it
export const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)
