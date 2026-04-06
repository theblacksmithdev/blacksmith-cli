import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['server/index.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  outDir: 'dist/server',
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: true,
  shims: true,
  external: ['express', 'socket.io', 'open', 'better-sqlite3', 'drizzle-orm'],
})
