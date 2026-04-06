import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { useFileStore } from '@/stores/file-store'
import type { FileNode } from '@/types'

export function useFiles() {
  const { selectFile, setFileContent } = useFileStore()

  const treeQuery = useQuery({
    queryKey: queryKeys.files,
    queryFn: () => api.get<FileNode>('/files'),
  })

  const fetchFileContent = async (filePath: string) => {
    selectFile(filePath)
    try {
      const data = await api.get<{ content: string; language: string; size: number }>(
        `/files/content?path=${encodeURIComponent(filePath)}`,
      )
      setFileContent(data.content, data.language)
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
