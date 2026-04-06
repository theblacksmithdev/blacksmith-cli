import { useState, useCallback } from 'react'
import { api } from '@/api/client'
import type { BrowseResult } from './types'

export function useBrowse() {
  const [data, setData] = useState<BrowseResult | null>(null)
  const [loading, setLoading] = useState(false)

  const browse = useCallback(async (dirPath?: string) => {
    setLoading(true)
    try {
      const params = dirPath ? `?path=${encodeURIComponent(dirPath)}` : ''
      const result = await api.get<BrowseResult>(`/browse${params}`)
      setData(result)
    } catch { /* stay on current */ }
    setLoading(false)
  }, [])

  return { data, loading, browse }
}
