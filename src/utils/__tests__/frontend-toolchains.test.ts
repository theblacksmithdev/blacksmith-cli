import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { FRONTEND_FRAMEWORKS, queryModuleFile } from '../frontend-toolchains.js'
import { frontendTemplateDirs, resourceFrontendTemplateDir } from '../scaffold.js'
import { getTemplatesDir } from '../paths.js'

describe('frontend toolchains', () => {
  it('names the module the query plugin generates', () => {
    expect(queryModuleFile('react')).toBe('@tanstack/react-query.gen.ts')
  })

  it.each(FRONTEND_FRAMEWORKS)('%s has project and resource templates', (framework) => {
    for (const dir of frontendTemplateDirs(framework)) {
      expect(fs.existsSync(path.join(getTemplatesDir(), dir)), dir).toBe(true)
    }
    for (const part of ['api', 'pages']) {
      const dir = path.join(getTemplatesDir(), resourceFrontendTemplateDir(framework), part)
      expect(fs.existsSync(dir), dir).toBe(true)
    }
  })
})
