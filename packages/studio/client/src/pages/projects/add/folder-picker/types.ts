export interface BrowseResult {
  current: string
  parent: string
  dirs: DirEntry[]
  isProject: boolean
  isBlacksmithProject: boolean
}

export interface DirEntry {
  name: string
  path: string
}
