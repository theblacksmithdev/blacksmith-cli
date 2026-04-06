export const queryKeys = {
  projects: ['projects'] as const,
  activeProject: ['projects', 'active'] as const,
  sessions: ['sessions'] as const,
  session: (id: string) => ['sessions', id] as const,
  files: ['files'] as const,
  fileContent: (path: string) => ['files', 'content', path] as const,
  templates: ['templates'] as const,
  settings: ['settings'] as const,
  health: ['health'] as const,
}
