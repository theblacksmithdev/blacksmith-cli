import { create } from 'zustand'

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

interface UiState {
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void
}

export const useUiStore = create<UiState>((set) => ({
  connectionStatus: 'disconnected',
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}))
