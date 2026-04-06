import { create } from 'zustand'

interface SettingsState {
  settings: Record<string, any>
  loaded: boolean

  setSettings: (settings: Record<string, any>) => void
  updateSetting: (key: string, value: any) => void
  fetchSettings: () => Promise<void>
  saveSetting: (key: string, value: any) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loaded: false,

  setSettings: (settings) => set({ settings, loaded: true }),

  updateSetting: (key, value) =>
    set((s) => ({ settings: { ...s.settings, [key]: value } })),

  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      set({ settings: data, loaded: true })
    } catch {
      // Use defaults on error
      set({ loaded: true })
    }
  },

  saveSetting: async (key, value) => {
    // Optimistic update
    get().updateSetting(key, value)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
    } catch {
      // Revert on error — refetch
      get().fetchSettings()
    }
  },
}))
