import { create } from 'zustand'

interface SessionState {
  activeSessionId: string | null
  setActiveSession: (id: string | null) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  setActiveSession: (activeSessionId) => set({ activeSessionId }),
}))
