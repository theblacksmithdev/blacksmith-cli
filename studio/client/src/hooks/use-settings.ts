import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { useCallback } from 'react'

export function useSettings() {
  const queryClient = useQueryClient()

  const { data: settings = {} } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => api.get<Record<string, any>>('/settings'),
  })

  const mutation = useMutation({
    mutationFn: (pair: { key: string; value: any }) =>
      api.patch<Record<string, any>>('/settings', { [pair.key]: pair.value }),
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings })
      const previous = queryClient.getQueryData<Record<string, any>>(queryKeys.settings)
      queryClient.setQueryData(queryKeys.settings, (old: Record<string, any> = {}) => ({
        ...old,
        [key]: value,
      }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })

  const set = useCallback(
    (key: string, value: any) => mutation.mutate({ key, value }),
    [mutation],
  )

  const get = useCallback(
    (key: string) => settings[key],
    [settings],
  )

  return {
    get,
    set,

    // Appearance
    theme: (settings['appearance.theme'] ?? 'system') as 'light' | 'dark' | 'system',
    fontSize: (settings['appearance.fontSize'] ?? 14) as number,
    sidebarCollapsed: (settings['appearance.sidebarCollapsed'] ?? false) as boolean,

    // AI
    model: (settings['ai.model'] ?? 'sonnet') as string,
    maxBudget: settings['ai.maxBudget'] as number | null,
    customInstructions: (settings['ai.customInstructions'] ?? '') as string,
    permissionMode: (settings['ai.permissionMode'] ?? 'bypassPermissions') as string,

    // Editor
    tabSize: (settings['editor.tabSize'] ?? 2) as number,
    wordWrap: (settings['editor.wordWrap'] ?? true) as boolean,
    minimap: (settings['editor.minimap'] ?? true) as boolean,
    lineNumbers: (settings['editor.lineNumbers'] ?? true) as boolean,

    // Project
    displayName: (settings['project.displayName'] ?? '') as string,
    ignoredPatterns: (settings['project.ignoredPatterns'] ?? '') as string,
  }
}
