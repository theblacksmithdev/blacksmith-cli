import { useChatStore } from './chat-store'
import { useFileStore } from './file-store'
import { useRunnerStore } from './runner-store'
import { useSessionStore } from './session-store'
import { clearFileContentCache } from '@/hooks/use-files'

/**
 * Reset all project-scoped stores.
 * Call this when switching projects to clear stale state.
 */
export function resetProjectStores() {
  // Chat
  useChatStore.getState().clearMessages()

  // Sessions
  useSessionStore.getState().setActiveSession(null)

  // Files — close all tabs, clear tree and content cache
  useFileStore.setState({
    tree: null,
    activeTab: null,
    openTabs: [],
    changedFiles: new Set(),
  })
  clearFileContentCache()

  // Runner — clear logs and reset status
  useRunnerStore.setState({
    backendStatus: 'stopped',
    frontendStatus: 'stopped',
    backendPort: null,
    frontendPort: null,
    logs: [],
  })
}
