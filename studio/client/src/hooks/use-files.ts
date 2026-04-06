import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { useFileStore } from '@/stores/file-store'
import type { FileNode } from '@/types'

// In-memory content cache to avoid re-fetching files
const contentCache = new Map<string, { content: string; language: string }>()

/** Clear the file content cache. Call when switching projects. */
export function clearFileContentCache() {
  contentCache.clear()
}

export function useFiles() {
  const { openFile, setTabContent } = useFileStore()

  const treeQuery = useQuery({
    queryKey: queryKeys.files,
    queryFn: () => api.get<FileNode>('/files'),
  })

  const fetchFileContent = async (filePath: string) => {
    openFile(filePath)

    // Serve from cache instantly
    const cached = contentCache.get(filePath)
    if (cached) {
      setTabContent(filePath, cached.content, cached.language)
      return
    }

    try {
      const data = await api.get<{ content: string; language: string; size: number }>(
        `/files/content?path=${encodeURIComponent(filePath)}`,
      )
      contentCache.set(filePath, { content: data.content, language: data.language })
      setTabContent(filePath, data.content, data.language)
    } catch {
      setTabContent(filePath, '// Failed to load file', 'text')
    }
  }

  return {
    tree: treeQuery.data ?? null,
    isLoading: treeQuery.isLoading,
    fetchFileTree: () => treeQuery.refetch(),
    fetchFileContent,
  }
}
