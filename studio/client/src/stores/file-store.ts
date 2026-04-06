import { create } from 'zustand'
import type { FileNode } from '@/types'

interface FileState {
  tree: FileNode | null
  selectedFile: string | null
  fileContent: string | null
  fileLanguage: string
  changedFiles: Set<string>

  setTree: (tree: FileNode) => void
  selectFile: (path: string | null) => void
  setFileContent: (content: string, language: string) => void
  markChanged: (paths: string[]) => void
  clearChanged: () => void
}

export const useFileStore = create<FileState>((set) => ({
  tree: null,
  selectedFile: null,
  fileContent: null,
  fileLanguage: 'text',
  changedFiles: new Set(),

  setTree: (tree) => set({ tree }),
  selectFile: (selectedFile) => set({ selectedFile, fileContent: null }),
  setFileContent: (fileContent, fileLanguage) => set({ fileContent, fileLanguage }),
  markChanged: (paths) =>
    set((s) => {
      const next = new Set(s.changedFiles)
      paths.forEach((p) => next.add(p))
      return { changedFiles: next }
    }),
  clearChanged: () => set({ changedFiles: new Set() }),
}))
