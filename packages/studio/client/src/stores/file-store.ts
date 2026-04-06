import { create } from 'zustand'
import type { FileNode } from '@/types'

export interface OpenTab {
  path: string
  content: string | null
  language: string
}

interface FileState {
  tree: FileNode | null
  activeTab: string | null
  openTabs: OpenTab[]
  changedFiles: Set<string>

  setTree: (tree: FileNode) => void
  openFile: (path: string) => void
  setTabContent: (path: string, content: string, language: string) => void
  closeTab: (path: string) => void
  selectTab: (path: string) => void
  markChanged: (paths: string[]) => void
  clearChanged: () => void

  // Legacy compat
  selectFile: (path: string | null) => void
}

export const useFileStore = create<FileState>((set, get) => ({
  tree: null,
  activeTab: null,
  openTabs: [],
  changedFiles: new Set(),

  setTree: (tree) => set({ tree }),

  openFile: (path) => {
    const { openTabs } = get()
    const exists = openTabs.find((t) => t.path === path)
    if (!exists) {
      set({
        openTabs: [...openTabs, { path, content: null, language: 'text' }],
        activeTab: path,
      })
    } else {
      set({ activeTab: path })
    }
  },

  setTabContent: (path, content, language) => {
    set((s) => ({
      openTabs: s.openTabs.map((t) =>
        t.path === path ? { ...t, content, language } : t,
      ),
    }))
  },

  closeTab: (path) => {
    const { openTabs, activeTab } = get()
    const idx = openTabs.findIndex((t) => t.path === path)
    const next = openTabs.filter((t) => t.path !== path)

    let newActive = activeTab
    if (activeTab === path) {
      if (next.length === 0) {
        newActive = null
      } else if (idx >= next.length) {
        newActive = next[next.length - 1].path
      } else {
        newActive = next[idx].path
      }
    }

    set({ openTabs: next, activeTab: newActive })
  },

  selectTab: (path) => set({ activeTab: path }),

  markChanged: (paths) =>
    set((s) => {
      const next = new Set(s.changedFiles)
      paths.forEach((p) => next.add(p))
      return { changedFiles: next }
    }),

  clearChanged: () => set({ changedFiles: new Set() }),

  // Legacy — used by file-browser's onClose and tree selection
  selectFile: (path) => {
    if (path) {
      get().openFile(path)
    } else {
      set({ activeTab: null })
    }
  },
}))
