import fs from 'node:fs'
import path from 'node:path'
import Handlebars from 'handlebars'

/**
 * Register custom Handlebars helpers
 */
Handlebars.registerHelper('eq', (a: any, b: any) => a === b)
Handlebars.registerHelper('ne', (a: any, b: any) => a !== b)
Handlebars.registerHelper('upper', (str: string) => str?.toUpperCase())
Handlebars.registerHelper('lower', (str: string) => str?.toLowerCase())

/**
 * Render a Handlebars template string with context data.
 * Pre-processes JSX-style braces that collide with Handlebars triple-brace syntax.
 */
export function renderTemplate(templateStr: string, context: Record<string, any>): string {
  // Replace literal JSX braces adjacent to Handlebars expressions:
  //   `{ {{var}}` → `OPEN_BRACE {{var}}`  (prevents `{{{` triple-brace parse)
  //   `{{var}}} ` → `{{var}} CLOSE_BRACE` (prevents `}}}` triple-brace parse)
  let safeStr = templateStr
    .replace(/\{(\s*)(?=\{\{[^{])/g, 'BLACKSMITH_OB$1')
    .replace(/([^}]\}\})(\s*)\}/g, '$1$2BLACKSMITH_CB')

  const template = Handlebars.compile(safeStr, { noEscape: true })
  const rendered = template(context)

  return rendered
    .replace(/BLACKSMITH_OB/g, '{')
    .replace(/BLACKSMITH_CB/g, '}')
}

/**
 * Read a template file and render it with context data
 */
export function renderTemplateFile(templatePath: string, context: Record<string, any>): string {
  const templateStr = fs.readFileSync(templatePath, 'utf-8')
  return renderTemplate(templateStr, context)
}

/**
 * Render a template file and write the output to a destination
 */
export function renderToFile(
  templatePath: string,
  destPath: string,
  context: Record<string, any>
) {
  const rendered = renderTemplateFile(templatePath, context)
  const destDir = path.dirname(destPath)

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  fs.writeFileSync(destPath, rendered, 'utf-8')
}

/**
 * Recursively render all templates from a source directory to a destination directory.
 * Template files (.hbs) are rendered and written without the .hbs extension.
 * Non-template files are copied as-is.
 * Directory names and file names containing Handlebars expressions are also rendered.
 */
export function renderDirectory(
  srcDir: string,
  destDir: string,
  context: Record<string, any>
) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Template directory not found: ${srcDir}`)
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true })

  for (const entry of entries) {
    // Render the name itself (for files like {{kebab}}-form.tsx.hbs)
    const renderedName = renderTemplate(entry.name, context)
    const srcPath = path.join(srcDir, entry.name)

    if (entry.isDirectory()) {
      const destSubDir = path.join(destDir, renderedName)
      renderDirectory(srcPath, destSubDir, context)
    } else if (entry.name.endsWith('.hbs')) {
      // Template file: render and write without .hbs extension
      const outputName = renderedName.replace(/\.hbs$/, '')
      const destPath = path.join(destDir, outputName)
      renderToFile(srcPath, destPath, context)
    } else {
      // Non-template file: copy as-is
      const destPath = path.join(destDir, renderedName)
      const destDirPath = path.dirname(destPath)
      if (!fs.existsSync(destDirPath)) {
        fs.mkdirSync(destDirPath, { recursive: true })
      }
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

/**
 * Append text to a file after a specific marker line
 */
export function appendAfterMarker(
  filePath: string,
  marker: string,
  content: string
) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const lines = fileContent.split('\n')
  const markerIndex = lines.findIndex((line) => line.includes(marker))

  if (markerIndex === -1) {
    throw new Error(`Marker "${marker}" not found in ${filePath}`)
  }

  lines.splice(markerIndex + 1, 0, content)
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
}

/**
 * Insert text before a specific marker line
 */
export function insertBeforeMarker(
  filePath: string,
  marker: string,
  content: string
) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const lines = fileContent.split('\n')
  const markerIndex = lines.findIndex((line) => line.includes(marker))

  if (markerIndex === -1) {
    throw new Error(`Marker "${marker}" not found in ${filePath}`)
  }

  lines.splice(markerIndex, 0, content)
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
}
