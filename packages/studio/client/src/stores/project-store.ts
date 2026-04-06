import { create } from 'zustand'

export interface Project {
  id: string
  name: string
  path: string
  createdAt: string
  lastOpenedAt: string
}

interface ProjectState {
  activeProject: Project | null
  setActiveProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: null,
  setActiveProject: (activeProject) => set({ activeProject }),
}))
