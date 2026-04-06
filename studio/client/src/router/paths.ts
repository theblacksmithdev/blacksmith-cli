export const Path = {
  Home: '/',
  NewChat: '/chat/new',
  Chat: '/chat/:sessionId',
  Code: '/code',
  Run: '/run',
  Templates: '/templates',
  Activity: '/activity',
  Settings: '/settings',
} as const

export function chatPath(sessionId: string) {
  return `/chat/${sessionId}`
}
