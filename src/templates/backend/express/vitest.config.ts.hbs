import { defineConfig } from 'vitest/config'
import { TEST_DATABASE_URL } from './src/__tests__/database-url'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      JWT_SECRET: 'test-secret-not-used-outside-the-test-suite',
    },
    // Every spec file shares one SQLite database, and the setup file empties
    // it between tests — so files must not run at the same time. This mirrors
    // how pytest-django runs the Django backend's suite.
    fileParallelism: false,
    globalSetup: ['src/__tests__/global-setup.ts'],
    setupFiles: ['src/__tests__/setup.ts'],
  },
})
