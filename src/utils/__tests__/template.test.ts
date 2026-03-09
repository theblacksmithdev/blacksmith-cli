import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  renderTemplate,
  renderTemplateFile,
  renderToFile,
  renderDirectory,
  appendAfterMarker,
  insertBeforeMarker,
} from '../template.js'

describe('renderTemplate', () => {
  it('should render simple variables', () => {
    const result = renderTemplate('Hello {{name}}!', { name: 'World' })
    expect(result).toBe('Hello World!')
  })

  it('should render multiple variables', () => {
    const result = renderTemplate('{{greeting}} {{name}}!', {
      greeting: 'Hi',
      name: 'Alice',
    })
    expect(result).toBe('Hi Alice!')
  })

  it('should handle eq helper', () => {
    const template = '{{#if (eq type "admin")}}admin{{else}}user{{/if}}'
    expect(renderTemplate(template, { type: 'admin' })).toBe('admin')
    expect(renderTemplate(template, { type: 'guest' })).toBe('user')
  })

  it('should handle ne helper', () => {
    const template = '{{#if (ne status "active")}}inactive{{else}}active{{/if}}'
    expect(renderTemplate(template, { status: 'disabled' })).toBe('inactive')
    expect(renderTemplate(template, { status: 'active' })).toBe('active')
  })

  it('should handle upper helper', () => {
    const result = renderTemplate('{{upper name}}', { name: 'hello' })
    expect(result).toBe('HELLO')
  })

  it('should handle lower helper', () => {
    const result = renderTemplate('{{lower name}}', { name: 'HELLO' })
    expect(result).toBe('hello')
  })

  it('should preserve JSX braces next to Handlebars expressions', () => {
    // Simulates JSX like: { {{var}} }
    const result = renderTemplate('{ {{name}} }', { name: 'value' })
    expect(result).toBe('{ value }')
  })

  it('should handle template with no variables', () => {
    const result = renderTemplate('plain text', {})
    expect(result).toBe('plain text')
  })
})

describe('file-based template operations', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('renderTemplateFile', () => {
    it('should read and render a template file', () => {
      const templatePath = path.join(tmpDir, 'test.hbs')
      fs.writeFileSync(templatePath, 'Hello {{name}}!')

      const result = renderTemplateFile(templatePath, { name: 'World' })
      expect(result).toBe('Hello World!')
    })
  })

  describe('renderToFile', () => {
    it('should render a template and write to destination', () => {
      const templatePath = path.join(tmpDir, 'test.hbs')
      const destPath = path.join(tmpDir, 'output', 'result.txt')
      fs.writeFileSync(templatePath, 'Hello {{name}}!')

      renderToFile(templatePath, destPath, { name: 'World' })

      expect(fs.readFileSync(destPath, 'utf-8')).toBe('Hello World!')
    })

    it('should create destination directories if they do not exist', () => {
      const templatePath = path.join(tmpDir, 'test.hbs')
      const destPath = path.join(tmpDir, 'a', 'b', 'c', 'result.txt')
      fs.writeFileSync(templatePath, 'content')

      renderToFile(templatePath, destPath, {})

      expect(fs.existsSync(destPath)).toBe(true)
    })
  })

  describe('renderDirectory', () => {
    it('should render .hbs files and remove extension', () => {
      const srcDir = path.join(tmpDir, 'src')
      const destDir = path.join(tmpDir, 'dest')
      fs.mkdirSync(srcDir)
      fs.writeFileSync(path.join(srcDir, 'index.tsx.hbs'), 'const app = "{{name}}"')

      renderDirectory(srcDir, destDir, { name: 'MyApp' })

      const outputPath = path.join(destDir, 'index.tsx')
      expect(fs.existsSync(outputPath)).toBe(true)
      expect(fs.readFileSync(outputPath, 'utf-8')).toBe('const app = "MyApp"')
    })

    it('should copy non-hbs files as-is', () => {
      const srcDir = path.join(tmpDir, 'src')
      const destDir = path.join(tmpDir, 'dest')
      fs.mkdirSync(srcDir)
      fs.writeFileSync(path.join(srcDir, 'logo.png'), 'binary-content')

      renderDirectory(srcDir, destDir, {})

      expect(fs.readFileSync(path.join(destDir, 'logo.png'), 'utf-8')).toBe('binary-content')
    })

    it('should recursively process subdirectories', () => {
      const srcDir = path.join(tmpDir, 'src')
      const destDir = path.join(tmpDir, 'dest')
      fs.mkdirSync(path.join(srcDir, 'sub'), { recursive: true })
      fs.writeFileSync(path.join(srcDir, 'sub', 'file.ts.hbs'), '{{name}}')

      renderDirectory(srcDir, destDir, { name: 'test' })

      expect(fs.readFileSync(path.join(destDir, 'sub', 'file.ts'), 'utf-8')).toBe('test')
    })

    it('should render directory names with Handlebars expressions', () => {
      const srcDir = path.join(tmpDir, 'src')
      const destDir = path.join(tmpDir, 'dest')
      fs.mkdirSync(path.join(srcDir, '{{kebab}}'), { recursive: true })
      fs.writeFileSync(path.join(srcDir, '{{kebab}}', 'index.ts.hbs'), 'export default "{{name}}"')

      renderDirectory(srcDir, destDir, { kebab: 'my-feature', name: 'MyFeature' })

      const outputPath = path.join(destDir, 'my-feature', 'index.ts')
      expect(fs.existsSync(outputPath)).toBe(true)
      expect(fs.readFileSync(outputPath, 'utf-8')).toBe('export default "MyFeature"')
    })

    it('should throw when source directory does not exist', () => {
      expect(() => renderDirectory('/nonexistent', tmpDir, {})).toThrow(
        'Template directory not found'
      )
    })
  })

  describe('appendAfterMarker', () => {
    it('should insert content after the marker line', () => {
      const filePath = path.join(tmpDir, 'test.txt')
      fs.writeFileSync(filePath, 'line1\n// MARKER\nline3')

      appendAfterMarker(filePath, '// MARKER', 'inserted')

      expect(fs.readFileSync(filePath, 'utf-8')).toBe('line1\n// MARKER\ninserted\nline3')
    })

    it('should throw when marker is not found', () => {
      const filePath = path.join(tmpDir, 'test.txt')
      fs.writeFileSync(filePath, 'no marker here')

      expect(() => appendAfterMarker(filePath, '// MISSING', 'content')).toThrow(
        'Marker "// MISSING" not found'
      )
    })
  })

  describe('insertBeforeMarker', () => {
    it('should insert content before the marker line', () => {
      const filePath = path.join(tmpDir, 'test.txt')
      fs.writeFileSync(filePath, 'line1\n// MARKER\nline3')

      insertBeforeMarker(filePath, '// MARKER', 'inserted')

      expect(fs.readFileSync(filePath, 'utf-8')).toBe('line1\ninserted\n// MARKER\nline3')
    })

    it('should throw when marker is not found', () => {
      const filePath = path.join(tmpDir, 'test.txt')
      fs.writeFileSync(filePath, 'no marker here')

      expect(() => insertBeforeMarker(filePath, '// MISSING', 'content')).toThrow(
        'Marker "// MISSING" not found'
      )
    })
  })
})
