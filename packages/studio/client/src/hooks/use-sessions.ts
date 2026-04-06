import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { useSessionStore } from '@/stores/session-store'
import { useProjectStore } from '@/stores/project-store'
import { useChatStore } from '@/stores/chat-store'
import type { Session, SessionSummary } from '@/types'

export function useSessions() {
  const queryClient = useQueryClient()
  const { setActiveSession } = useSessionStore()
  const { loadMessages, clearMessages } = useChatStore()
  const activeProject = useProjectStore((s) => s.activeProject)

  const sessionsQuery = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => api.get<SessionSummary[]>('/sessions'),
    enabled: !!activeProject,
  })

  const createMutation = useMutation({
    mutationFn: (name?: string) => api.post<Session>('/sessions', { name }),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      setActiveSession(session.id)
      clearMessages()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
    },
  })

  const loadSession = async (id: string) => {
    const session = await api.get<Session>(`/sessions/${id}`)
    setActiveSession(session.id)
    loadMessages(session.messages)
  }

  return {
    sessions: sessionsQuery.data ?? [],
    isLoading: sessionsQuery.isLoading,
    fetchSessions: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessions }),
    createSession: async (name?: string) => {
      const session = await createMutation.mutateAsync(name)
      return session
    },
    loadSession,
    deleteSession: (id: string) => deleteMutation.mutate(id),
  }
}
