import { useNavigate, useLocation } from 'react-router-dom'
import { useUiStore } from '@/stores/ui-store'
import { useSessionStore } from '@/stores/session-store'
import { useChatStore } from '@/stores/chat-store'
import { useSessions } from '@/hooks/use-sessions'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { Path, chatPath } from '@/router/paths'
import { SidebarCollapsed } from './sidebar-collapsed'
import { SidebarExpanded } from './sidebar-expanded'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const connectionStatus = useUiStore((s) => s.connectionStatus)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const { sessions, createSession, loadSession, deleteSession } = useSessions()
  const { mode, toggle: toggleTheme } = useThemeMode()

  const handleNewChat = () => {
    useChatStore.getState().clearMessages()
    useSessionStore.getState().setActiveSession(null)
    navigate(Path.NewChat)
  }

  const handleSelectSession = async (id: string) => {
    await loadSession(id)
    navigate(chatPath(id))
  }

  const recentSessions = sessions.slice(0, 8)
  const isOnline = connectionStatus === 'connected'

  if (collapsed) {
    return (
      <SidebarCollapsed
        locationPathname={location.pathname}
        isOnline={isOnline}
        mode={mode}
        onToggleSidebar={toggleSidebar}
        onNewChat={handleNewChat}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <SidebarExpanded
      locationPathname={location.pathname}
      isOnline={isOnline}
      mode={mode}
      activeSessionId={activeSessionId}
      recentSessions={recentSessions}
      onToggleSidebar={toggleSidebar}
      onNewChat={handleNewChat}
      onNavigate={navigate}
      onToggleTheme={toggleTheme}
      onSelectSession={handleSelectSession}
      onDeleteSession={deleteSession}
    />
  )
}
