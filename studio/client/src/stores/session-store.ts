import { create } from 'zustand'
import type { SessionSummary } from '@/types'

interface SessionState {
  sessions: SessionSummary[]
  activeSessionId: string | null

  setSessions: (sessions: SessionSummary[]) => void
  setActiveSession: (id: string | null) => void
  addSession: (session: SessionSummary) => void
  removeSession: (id: string) => void
  updateSession: (id: string, updates: Partial<SessionSummary>) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSessionId: null,

  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (activeSessionId) => set({ activeSessionId }),
  addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
  removeSession: (id) => set((s) => ({ sessions: s.sessions.filter((ss) => ss.id !== id) })),
  updateSession: (id, updates) =>
    set((s) => ({
      sessions: s.sessions.map((ss) => (ss.id === id ? { ...ss, ...updates } : ss)),
    })),
}))
