import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/studio/db/schema.ts',
  out: './src/studio/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: '.blacksmith-studio/studio.db',
  },
})
