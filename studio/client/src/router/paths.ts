export const Path = {
  Home: '/',
  NewChat: '/chat/new',
  Chat: '/chat/:sessionId',
  Templates: '/templates',
  Code: '/code',
  Run: '/run',
  Activity: '/activity',
  Settings: '/settings',
} as const

export function chatPath(sessionId: string) {
  return `/chat/${sessionId}`
}
