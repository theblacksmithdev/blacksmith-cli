import { useCallback } from 'react'
import { useFileStore } from '@/stores/file-store'

const API = '/api'

export function useFiles() {
  const { setTree, selectFile, setFileContent } = useFileStore()

  const fetchFileTree = useCallback(async () => {
    const res = await fetch(`${API}/files`)
    const tree = await res.json()
    setTree(tree)
  }, [setTree])

  const fetchFileContent = useCallback(async (filePath: string) => {
    selectFile(filePath)
    const res = await fetch(`${API}/files/content?path=${encodeURIComponent(filePath)}`)
    if (!res.ok) return
    const data = await res.json()
    setFileContent(data.content, data.language)
  }, [selectFile, setFileContent])

  return { fetchFileTree, fetchFileContent }
}
