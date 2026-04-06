import { create } from 'zustand'

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

interface UiState {
  sidebarCollapsed: boolean
  connectionStatus: ConnectionStatus

  toggleSidebar: () => void
  setConnectionStatus: (status: ConnectionStatus) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  connectionStatus: 'disconnected',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}))
