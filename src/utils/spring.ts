import fs from 'node:fs'
import path from 'node:path'
import type { NameVariants } from './names.js'

/** Where a Spring backend's Flyway migrations live, relative to the backend root. */
export const FLYWAY_MIGRATIONS_DIR = path.join('src', 'main', 'resources', 'db', 'migration')

/**
 * The Java package a Spring resource lives in, under `app`. Java packages are
 * lowercase with the words run together, so `BlogPost` lives in `app.blogposts`.
 */
export function springResourcePackage(names: NameVariants): string {
  return names.snakes.replace(/_/g, '')
}

/** The source directory of a Spring resource's package. */
export function springResourceDir(backendDir: string, names: NameVariants): string {
  return path.join(backendDir, 'src', 'main', 'java', 'app', springResourcePackage(names))
}

/**
 * The version for the next Flyway migration: one past the highest
 * `V<n>__*.sql` already in the migrations directory.
 */
export function nextFlywayVersion(backendDir: string): number {
  const dir = path.join(backendDir, FLYWAY_MIGRATIONS_DIR)
  const versions = (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
    .map((file) => /^V(\d+)__.*\.sql$/.exec(file))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]))
  return Math.max(0, ...versions) + 1
}
