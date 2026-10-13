/**
 * Color Mode Store
 *
 * The UI kit styles dark mode from a `dark` class on <html>. This module
 * owns that class: it follows the OS by default and remembers an explicit
 * choice in localStorage.
 */

export type ColorMode = 'light' | 'dark'

const STORAGE_KEY = 'color-mode'
const listeners = new Set<() => void>()

function systemQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)')
}

function storedColorMode(): ColorMode | null {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : null
}

export function getColorMode(): ColorMode {
  return storedColorMode() ?? (systemQuery().matches ? 'dark' : 'light')
}

/** Sync the <html> class with the current mode. Call once before rendering. */
export function applyColorMode() {
  const mode = getColorMode()
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.classList.toggle('light', mode === 'light')
  root.style.colorScheme = mode
  listeners.forEach((listener) => listener())
}

export function setColorMode(mode: ColorMode) {
  localStorage.setItem(STORAGE_KEY, mode)
  applyColorMode()
}

/** Subscribe to mode changes, including OS changes while no choice is stored. */
export function subscribeColorMode(listener: () => void) {
  const query = systemQuery()
  listeners.add(listener)
  query.addEventListener('change', applyColorMode)

  return () => {
    listeners.delete(listener)
    query.removeEventListener('change', applyColorMode)
  }
}
