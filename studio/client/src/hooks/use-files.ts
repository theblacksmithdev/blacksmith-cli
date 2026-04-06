import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { useFileStore } from '@/stores/file-store'
import type { FileNode } from '@/types'

export function useFiles() {
  const { openFile, setTabContent } = useFileStore()

  const treeQuery = useQuery({
    queryKey: queryKeys.files,
    queryFn: () => api.get<FileNode>('/files'),
  })

  const fetchFileContent = async (filePath: string) => {
    openFile(filePath)

    // Check if content is already cached in the tab
    const tab = useFileStore.getState().openTabs.find((t) => t.path === filePath)
    if (tab?.content !== null) return

    try {
      const data = await api.get<{ content: string; language: string; size: number }>(
        `/files/content?path=${encodeURIComponent(filePath)}`,
      )
      setTabContent(filePath, data.content, data.language)
    } catch {
      // Ignore errors
    }
  }

  return {
    tree: treeQuery.data ?? null,
    isLoading: treeQuery.isLoading,
    fetchFileTree: () => treeQuery.refetch(),
    fetchFileContent,
  }
}
