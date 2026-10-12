import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { useTmpDir } from '../../__tests__/helpers.js'
import { generateNames } from '../names.js'
import { FLYWAY_MIGRATIONS_DIR, nextFlywayVersion, springResourceDir, springResourcePackage } from '../spring.js'

describe('springResourcePackage', () => {
  it('runs the words of the plural together in lowercase', () => {
    expect(springResourcePackage(generateNames('BlogPost'))).toBe('blogposts')
    expect(springResourcePackage(generateNames('order'))).toBe('orders')
  })

  it('places the package under src/main/java/app', () => {
    expect(springResourceDir('/b', generateNames('BlogPost'))).toBe(
      path.join('/b', 'src', 'main', 'java', 'app', 'blogposts')
    )
  })
})

describe('nextFlywayVersion', () => {
  const getTmpDir = useTmpDir()

  it('is one past the highest existing version, gaps and all', () => {
    const dir = path.join(getTmpDir(), FLYWAY_MIGRATIONS_DIR)
    fs.mkdirSync(dir, { recursive: true })
    for (const file of ['V1__create_users.sql', 'V10__add_bio.sql', 'V3__x.sql', 'README.md', 'R__view.sql']) {
      fs.writeFileSync(path.join(dir, file), '')
    }

    expect(nextFlywayVersion(getTmpDir())).toBe(11)
  })

  it('starts at 1 without a migrations directory', () => {
    expect(nextFlywayVersion(getTmpDir())).toBe(1)
  })
})
