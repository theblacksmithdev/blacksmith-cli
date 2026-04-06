// ─── Global routes (no project) ───
export const Path = {
  Home: '/',
  Projects: '/projects',
  AddProject: '/projects/add',

  // ─── Project-scoped routes ───
  Project: '/:projectId',
  NewChat: '/:projectId/chat/new',
  Chat: '/:projectId/chat/:sessionId',
  Code: '/:projectId/code',
  Run: '/:projectId/run',
  Templates: '/:projectId/templates',
  Activity: '/:projectId/activity',
  Settings: '/:projectId/settings',
} as const

// ─── Path builders ───

export function projectHome(projectId: string) {
  return `/${projectId}`
}

export function newChatPath(projectId: string) {
  return `/${projectId}/chat/new`
}

export function chatPath(projectId: string, sessionId: string) {
  return `/${projectId}/chat/${sessionId}`
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

export function settingsPath(projectId: string) {
  return `/${projectId}/settings`
}
