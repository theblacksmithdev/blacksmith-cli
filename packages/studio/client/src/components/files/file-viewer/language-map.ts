export const languageMap: Record<string, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  json: 'json',
  html: 'html',
  css: 'css',
  markdown: 'markdown',
  yaml: 'yaml',
  toml: 'toml',
  sql: 'sql',
  bash: 'shell',
  text: 'plaintext',
  handlebars: 'handlebars',
}

export function getMonacoLanguage(language: string): string {
  return languageMap[language] || 'plaintext'
}
