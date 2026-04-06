import { useCallback } from 'react'
import { useSessionStore } from '@/stores/session-store'
import { useChatStore } from '@/stores/chat-store'
import type { Session, SessionSummary } from '@/types'

const API = '/api'

export function useSessions() {
  const { setSessions, setActiveSession, addSession, removeSession } = useSessionStore()
  const { loadMessages, clearMessages } = useChatStore()

  const fetchSessions = useCallback(async () => {
    const res = await fetch(`${API}/sessions`)
    const data: SessionSummary[] = await res.json()
    setSessions(data)
  }, [setSessions])

  const createSession = useCallback(async (name?: string) => {
    const res = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const session: Session = await res.json()
    addSession({
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: 0,
    })
    setActiveSession(session.id)
    clearMessages()
    return session
  }, [addSession, setActiveSession, clearMessages])

  const loadSession = useCallback(async (id: string) => {
    const res = await fetch(`${API}/sessions/${id}`)
    if (!res.ok) return
    const session: Session = await res.json()
    setActiveSession(session.id)
    loadMessages(session.messages)
  }, [setActiveSession, loadMessages])

  const deleteSession = useCallback(async (id: string) => {
    await fetch(`${API}/sessions/${id}`, { method: 'DELETE' })
    removeSession(id)
  }, [removeSession])

  return { fetchSessions, createSession, loadSession, deleteSession }
}
