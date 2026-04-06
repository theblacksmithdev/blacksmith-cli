import { useCallback } from 'react'
import { useSettingsStore } from '@/stores/settings-store'

export function useSettings() {
  const settings = useSettingsStore((s) => s.settings)
  const saveSetting = useSettingsStore((s) => s.saveSetting)

  const get = useCallback((key: string) => settings[key], [settings])

  const set = useCallback(
    (key: string, value: any) => saveSetting(key, value),
    [saveSetting],
  )

  return {
    get,
    set,

    // Appearance
    theme: (settings['appearance.theme'] ?? 'system') as 'light' | 'dark' | 'system',
    fontSize: (settings['appearance.fontSize'] ?? 14) as number,
    sidebarCollapsed: (settings['appearance.sidebarCollapsed'] ?? false) as boolean,

    // AI
    model: (settings['ai.model'] ?? 'sonnet') as string,
    maxBudget: settings['ai.maxBudget'] as number | null,
    customInstructions: (settings['ai.customInstructions'] ?? '') as string,
    permissionMode: (settings['ai.permissionMode'] ?? 'bypassPermissions') as string,

    // Editor
    tabSize: (settings['editor.tabSize'] ?? 2) as number,
    wordWrap: (settings['editor.wordWrap'] ?? true) as boolean,
    minimap: (settings['editor.minimap'] ?? true) as boolean,
    lineNumbers: (settings['editor.lineNumbers'] ?? true) as boolean,

    // Project
    displayName: (settings['project.displayName'] ?? '') as string,
    ignoredPatterns: (settings['project.ignoredPatterns'] ?? '') as string,
  }
}
