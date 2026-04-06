import { useState, useEffect, useCallback } from 'react'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'studio-theme-mode'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)

  useEffect(() => {
    applyMode(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  // Apply on mount (before first paint ideally, but this is close enough)
  useEffect(() => {
    applyMode(getInitialMode())
  }, [])

  const toggle = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'))
  }, [])

  return { mode, toggle, setMode }
}
