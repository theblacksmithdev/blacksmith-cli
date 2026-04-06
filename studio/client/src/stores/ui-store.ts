import { create } from 'zustand'

export type ActiveView = 'chat' | 'templates' | 'files' | 'activity'
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

interface UiState {
  sidebarCollapsed: boolean
  activeView: ActiveView
  connectionStatus: ConnectionStatus

  toggleSidebar: () => void
  setActiveView: (view: ActiveView) => void
  setConnectionStatus: (status: ConnectionStatus) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  activeView: 'chat',
  connectionStatus: 'disconnected',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActiveView: (activeView) => set({ activeView }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}))
