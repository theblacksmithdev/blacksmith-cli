import { Box, VStack } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MessageSquare,
  FolderTree,
  Play,
  Sparkles,
  History,
  Settings,
  Anvil,
  Sun,
  Moon,
  LayoutDashboard,
} from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'
import { useUiStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { useProjects } from '@/hooks/use-projects'
import {
  Path,
  newChatPath,
  codePath,
  runPath,
  templatesPath,
  activityPath,
} from '@/router/paths'

const railBtn = (active = false) => ({
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  border: 'none',
  background: active ? 'var(--studio-bg-hover)' : 'transparent',
  color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.12s ease',
  '&:hover': {
    background: active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
    color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)',
  },
})

export function NavRail() {
  const navigate = useNavigate()
  const location = useLocation()
  const connectionStatus = useUiStore((s) => s.connectionStatus)
  const activeProject = useProjectStore((s) => s.activeProject)
  const { mode, toggle: toggleTheme } = useThemeMode()

  useProjects() // Load projects on mount

  const pid = activeProject?.id
  const pathname = location.pathname

  // Project-scoped nav items — only render when a project is active
  const projectNav = pid ? [
    { path: newChatPath(pid), match: pathname.includes('/chat'), icon: MessageSquare, label: 'Chat' },
    { path: codePath(pid), match: pathname.endsWith('/code'), icon: FolderTree, label: 'Code' },
    { path: runPath(pid), match: pathname.endsWith('/run'), icon: Play, label: 'Run' },
    { path: templatesPath(pid), match: pathname.endsWith('/templates'), icon: Sparkles, label: 'Templates' },
  ] : []

  const projectBottomNav = pid ? [
    { path: activityPath(pid), match: pathname.endsWith('/activity'), icon: History, label: 'History' },
  ] : []

  return (
    <Box
      as="nav"
      css={{
        width: '56px',
        background: 'var(--studio-bg-sidebar)',
        borderRight: '1px solid var(--studio-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        flexShrink: 0,
        paddingTop: '12px',
        paddingBottom: '10px',
      }}
    >
      {/* Logo — dashboard */}
      <Tooltip content="Dashboard">
        <Box
          as="button"
          onClick={() => navigate(Path.Home)}
          css={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--studio-accent)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'opacity 0.15s ease',
            '&:hover': { opacity: 0.85 },
          }}
        >
          <Anvil size={15} color="var(--studio-accent-fg)" />
        </Box>
      </Tooltip>

      {/* Project tools — only when project is active */}
      <VStack gap={1} flex={1}>
        {projectNav.map(({ path, match, icon: Icon, label }) => (
          <Tooltip key={path} content={label}>
            <Box as="button" onClick={() => navigate(path)} css={railBtn(match)}>
              <Icon size={18} />
            </Box>
          </Tooltip>
        ))}
      </VStack>

      {/* Bottom */}
      <VStack
        gap={1}
        css={{
          borderTop: '1px solid var(--studio-border)',
          paddingTop: '8px',
          marginTop: '4px',
          flexShrink: 0,
        }}
      >
        {projectBottomNav.map(({ path, match, icon: Icon, label }) => (
          <Tooltip key={path} content={label}>
            <Box as="button" onClick={() => navigate(path)} css={railBtn(match)}>
              <Icon size={18} />
            </Box>
          </Tooltip>
        ))}

        <Tooltip content="Settings">
          <Box as="button" onClick={() => navigate(Path.Settings)} css={railBtn(pathname === '/settings')}>
            <Settings size={17} />
          </Box>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip content={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <Box
            as="button"
            onClick={toggleTheme}
            css={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-surface)',
              color: 'var(--studio-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginTop: '4px',
              '&:hover': {
                background: 'var(--studio-bg-hover)',
                color: 'var(--studio-text-primary)',
                borderColor: 'var(--studio-border-hover)',
              },
            }}
          >
            {mode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </Box>
        </Tooltip>

        {/* Connection dot */}
        <Box
          css={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: connectionStatus === 'connected' ? 'var(--studio-green)' : 'var(--studio-error)',
            marginTop: '6px',
          }}
        />
      </VStack>
    </Box>
  )
}
