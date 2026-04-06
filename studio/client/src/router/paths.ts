// Global routes (no project context)
export const Path = {
  Home: '/',
  Projects: '/projects',
  AddProject: '/projects/add',
  Settings: '/settings',

  // Project-scoped routes (with :projectId param)
  NewChat: '/:projectId/chat/new',
  Chat: '/:projectId/chat/:sessionId',
  Code: '/:projectId/code',
  Run: '/:projectId/run',
  Templates: '/:projectId/templates',
  Activity: '/:projectId/activity',
} as const

// Helper to build project-scoped paths
export function projectPath(projectId: string, subpath: string) {
  return `/${projectId}${subpath}`
}

export function chatPath(projectId: string, sessionId: string) {
  return `/${projectId}/chat/${sessionId}`
}

export function newChatPath(projectId: string) {
  return `/${projectId}/chat/new`
}

export function codePath(projectId: string) {
  return `/${projectId}/code`
}

export function runPath(projectId: string) {
  return `/${projectId}/run`
}

export function templatesPath(projectId: string) {
  return `/${projectId}/templates`
}

export function activityPath(projectId: string) {
  return `/${projectId}/activity`
}
